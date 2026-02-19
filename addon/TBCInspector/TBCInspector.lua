local ADDON_NAME = "TBCInspector"
local BASE_URL = "http://localhost:3000/character/"

local defaults = { modifier = "shift" }
local db

---------------------------------------------------------------------------
-- Utilities
---------------------------------------------------------------------------

-- Convert realm name to URL slug ("Living Flame" -> "living-flame")
local function RealmSlug(realm)
    return string.lower(string.gsub(realm, " ", "-"))
end

-- Build the inspector URL from a name and realm string
local function BuildURLFromName(name, realm)
    if not name or name == "" then return nil end
    realm = realm and realm ~= "" and realm or GetRealmName()
    return BASE_URL .. RealmSlug(realm) .. "/" .. string.lower(name)
end

-- Build the inspector URL from a unit token
local function BuildURLFromUnit(unit)
    local name, realm = UnitName(unit)
    return BuildURLFromName(name, realm)
end

-- Check whether the configured modifier key is currently held
local function IsModifierDown()
    local mod = db and db.modifier or "shift"
    if mod == "shift" then return IsShiftKeyDown()
    elseif mod == "ctrl" then return IsControlKeyDown()
    elseif mod == "alt" then return IsAltKeyDown()
    else return true -- "none"
    end
end

---------------------------------------------------------------------------
-- Copy popup frame
---------------------------------------------------------------------------
local copyFrame = CreateFrame("Frame", "TBCInspectorCopyFrame", UIParent, "BackdropTemplate")
copyFrame:SetSize(360, 80)
copyFrame:SetPoint("CENTER")
copyFrame:SetFrameStrata("DIALOG")
copyFrame:SetMovable(true)
copyFrame:EnableMouse(true)
copyFrame:RegisterForDrag("LeftButton")
copyFrame:SetScript("OnDragStart", copyFrame.StartMoving)
copyFrame:SetScript("OnDragStop", copyFrame.StopMovingOrSizing)
copyFrame:SetBackdrop({
    bgFile = "Interface/DialogFrame/UI-DialogBox-Background",
    edgeFile = "Interface/DialogFrame/UI-DialogBox-Border",
    tile = true, tileSize = 32, edgeSize = 32,
    insets = { left = 11, right = 12, top = 12, bottom = 11 },
})
copyFrame:Hide()

local title = copyFrame:CreateFontString(nil, "OVERLAY", "GameFontNormalLarge")
title:SetPoint("TOP", 0, -16)
title:SetText("Copy Inspector URL")

local editBox = CreateFrame("EditBox", "TBCInspectorEditBox", copyFrame, "InputBoxTemplate")
editBox:SetSize(320, 20)
editBox:SetPoint("BOTTOM", 0, 18)
editBox:SetAutoFocus(true)
editBox:SetFontObject(ChatFontNormal)
editBox:SetScript("OnEscapePressed", function() copyFrame:Hide() end)
editBox:SetScript("OnEnterPressed", function() copyFrame:Hide() end)

local function ShowCopyURL(url)
    editBox:SetText(url)
    copyFrame:Show()
    editBox:SetFocus()
    editBox:HighlightText()
end

-- Close on Escape
tinsert(UISpecialFrames, "TBCInspectorCopyFrame")

---------------------------------------------------------------------------
-- Unit popup menu integration (modern Menu API)
---------------------------------------------------------------------------
local function AddInspectorButton(_, rootDescription, contextData)
    if not contextData then return end

    -- Try unit token first (unit frames, world right-click)
    local unit = contextData.unit
    if unit and UnitIsPlayer(unit) then
        rootDescription:CreateButton("Copy Inspector URL", function()
            local url = BuildURLFromUnit(unit)
            if url then
                ShowCopyURL(url)
            end
        end)
        return
    end

    -- Fall back to name + server (LFG, chat, friends, guild roster)
    local name = contextData.name
    if name and name ~= "" then
        local server = contextData.server
        rootDescription:CreateButton("Copy Inspector URL", function()
            local url = BuildURLFromName(name, server)
            if url then
                ShowCopyURL(url)
            end
        end)
    end
end

for _, tag in ipairs({
    "MENU_UNIT_SELF",
    "MENU_UNIT_PLAYER",
    "MENU_UNIT_PARTY",
    "MENU_UNIT_RAID_PLAYER",
    "MENU_UNIT_RAID",
    "MENU_UNIT_FRIEND",
    "MENU_UNIT_BN_FRIEND",
    "MENU_UNIT_GUILD",
    "MENU_UNIT_GUILD_OFFLINE",
    "MENU_UNIT_CHAT_ROSTER",
    "MENU_UNIT_WORLD_STATE_SCORE",
    "MENU_UNIT_TARGET",
    "MENU_UNIT_FOCUS",
    "MENU_LFG_FRAME_MEMBER_APPLY",
    "MENU_LFG_FRAME_SEARCH_ENTRY",
}) do
    pcall(Menu.ModifyMenu, tag, AddInspectorButton)
end

---------------------------------------------------------------------------
-- LFG Browse panel right-click hook
---------------------------------------------------------------------------
local function GetEntryName(button)
    for _, region in ipairs({button:GetRegions()}) do
        if region:GetObjectType() == "FontString" then
            local text = region:GetText()
            if text and text ~= "" then
                return text
            end
        end
    end
    return nil
end

local function HookLFGEntry(button)
    if button._tbcInspectorHooked then return end
    button._tbcInspectorHooked = true
    button:HookScript("OnMouseUp", function(self, mouseButton)
        if mouseButton == "RightButton" and IsModifierDown() then
            local name = GetEntryName(self)
            if not name then return end
            -- Handle "Name-Realm" format from cross-realm players
            local charName, charRealm = strsplit("-", name)
            local url = BuildURLFromName(charName, charRealm)
            if url then
                ShowCopyURL(url)
            end
        end
    end)
end

local function HookLFGBrowse()
    local scrollBox = LFGBrowseFrameScrollBox
    if not scrollBox or scrollBox._tbcInspectorHooked then return end
    scrollBox._tbcInspectorHooked = true

    -- Hook existing visible entries
    scrollBox:ForEachFrame(HookLFGEntry)

    -- Hook future entries as the scroll box updates
    if scrollBox.RegisterCallback then
        scrollBox:RegisterCallback("OnDataRangeChanged", function()
            scrollBox:ForEachFrame(HookLFGEntry)
        end, "TBCInspector")
    end
end

---------------------------------------------------------------------------
-- Settings panel
---------------------------------------------------------------------------
local settingsCategory

local function CreateSettingsPanel()
    local panel = CreateFrame("Frame", "TBCInspectorSettingsPanel")
    panel.name = ADDON_NAME

    local panelTitle = panel:CreateFontString(nil, "ARTWORK", "GameFontNormalLarge")
    panelTitle:SetPoint("TOPLEFT", 16, -16)
    panelTitle:SetText("TBC Inspector")

    local desc = panel:CreateFontString(nil, "ARTWORK", "GameFontHighlightSmall")
    desc:SetPoint("TOPLEFT", panelTitle, "BOTTOMLEFT", 0, -8)
    desc:SetText("Choose which modifier key must be held when right-clicking\nan LFG Browse entry to copy the Inspector URL.")

    local modLabel = panel:CreateFontString(nil, "ARTWORK", "GameFontNormal")
    modLabel:SetPoint("TOPLEFT", desc, "BOTTOMLEFT", 0, -16)
    modLabel:SetText("Modifier Key:")

    local options = {
        { key = "none",  label = "None (plain right-click)" },
        { key = "shift", label = "Shift" },
        { key = "ctrl",  label = "Ctrl" },
        { key = "alt",   label = "Alt" },
    }

    local buttons = {}
    local prev = modLabel
    for i, opt in ipairs(options) do
        local btn = CreateFrame("CheckButton", "TBCInspectorModifier" .. i, panel, "UIRadioButtonTemplate")
        btn:SetPoint("TOPLEFT", prev, "BOTTOMLEFT", i == 1 and 0 or 0, -4)
        btn.text = btn:CreateFontString(nil, "ARTWORK", "GameFontHighlight")
        btn.text:SetPoint("LEFT", btn, "RIGHT", 4, 0)
        btn.text:SetText(opt.label)
        btn.key = opt.key
        buttons[i] = btn
        prev = btn

        btn:SetScript("OnClick", function(self)
            db.modifier = self.key
            for _, b in ipairs(buttons) do
                b:SetChecked(b.key == db.modifier)
            end
        end)
    end

    panel:SetScript("OnShow", function()
        for _, b in ipairs(buttons) do
            b:SetChecked(b.key == db.modifier)
        end
    end)

    -- Register with the modern settings UI
    local category = Settings.RegisterCanvasLayoutCategory(panel, panel.name)
    category.ID = ADDON_NAME
    Settings.RegisterAddOnCategory(category)
    settingsCategory = category
end

---------------------------------------------------------------------------
-- Initialization
---------------------------------------------------------------------------
local initDone, lfgDone = false, false
local initFrame = CreateFrame("Frame")
initFrame:RegisterEvent("ADDON_LOADED")
initFrame:SetScript("OnEvent", function(self, event, addon)
    if not initDone and addon == ADDON_NAME then
        -- Initialize saved variables with defaults
        if not TBCInspectorDB then
            TBCInspectorDB = {}
        end
        for k, v in pairs(defaults) do
            if TBCInspectorDB[k] == nil then
                TBCInspectorDB[k] = v
            end
        end
        db = TBCInspectorDB

        CreateSettingsPanel()
        initDone = true
    end

    -- LFGBrowseFrame may be load-on-demand
    if not lfgDone and LFGBrowseFrameScrollBox then
        HookLFGBrowse()
        lfgDone = true
    end

    if initDone and lfgDone then
        self:UnregisterEvent("ADDON_LOADED")
    end
end)

-- If LFGBrowseFrameScrollBox already exists at load time
if LFGBrowseFrameScrollBox then
    HookLFGBrowse()
    lfgDone = true
end

---------------------------------------------------------------------------
-- Slash command
---------------------------------------------------------------------------
SLASH_TBCINSPECTOR1 = "/tbcinspect"
SlashCmdList["TBCINSPECTOR"] = function(msg)
    msg = strtrim(msg)
    if msg == "settings" or msg == "config" or msg == "options" then
        if settingsCategory then
            Settings.OpenToCategory(settingsCategory.ID)
        end
    elseif msg ~= "" then
        local realm = RealmSlug(GetRealmName())
        local url = BASE_URL .. realm .. "/" .. string.lower(msg)
        ShowCopyURL(url)
    elseif UnitExists("target") and UnitIsPlayer("target") then
        local url = BuildURLFromUnit("target")
        if url then
            ShowCopyURL(url)
        end
    else
        print("|cff00ccff[TBC Inspector]|r Usage:")
        print("  /tbcinspect - Copy URL for current target")
        print("  /tbcinspect <name> - Copy URL for a character on your realm")
        print("  /tbcinspect settings - Open settings panel")
    end
end

print("|cff00ccff[TBC Inspector]|r Loaded. Right-click a player to copy their Inspector URL.")
