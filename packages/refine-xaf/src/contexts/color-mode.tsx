
import React, {
    PropsWithChildren,
    createContext,
    useEffect,
    useState,
    useContext,
} from "react";
import { ConfigProvider, theme } from "antd/lib";
import { RefineThemes } from "@refinedev/antd";

type ColorModeContextType = {
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
    {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    const colorModeFromLocalStorage = localStorage.getItem("colorMode");
    const isSystemPreferenceDark = window?.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    const systemPreference = isSystemPreferenceDark ? "dark" : "light";
    const [mode, setMode] = useState<"light" | "dark">(
        (colorModeFromLocalStorage || systemPreference) as "light" | "dark"
    );

    useEffect(() => {
        window.localStorage.setItem("colorMode", mode);
    }, [mode]);

    const setColorMode = () => {
        if (mode === "light") {
            setMode("dark");
        } else {
            setMode("light");
        }
    };

    const { darkAlgorithm, defaultAlgorithm } = theme;

    return (
        <ColorModeContext.Provider
            value={{
                setMode,
                mode,
            }}
        >
            <ConfigProvider
                // you can change the theme colors here. example: ...RefineThemes.Magenta,
                theme={{
                    ...RefineThemes.Blue,
                    algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
                }}
            >
                {children}
            </ConfigProvider>
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => {
    const context = useContext(ColorModeContext);
    if (context === undefined) {
        throw new Error("useColorMode must be used within a ColorModeContextProvider");
    }
    return context;
};
