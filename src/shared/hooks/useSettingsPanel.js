import { createContext, useContext } from "react";

// true — сторінка відкрита праворуч від меню «Einstellungen» на ПК.
// Тоді в неї немає кнопки «назад» і великого заголовка: їх замінює меню розділів зліва.
export const SettingsPanelContext = createContext(false);

export const useInSettingsPanel = () => useContext(SettingsPanelContext);
