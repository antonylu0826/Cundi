import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";

type ColorMode = "light" | "dark";

type ColorModeContextType = {
    mode: ColorMode;
    setMode: (mode: ColorMode) => void;
    toggleTheme: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
    {} as ColorModeContextType
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
    children,
}) => {
    const [mode, setMode] = useState<ColorMode>("light");

    useEffect(() => {
        const storedMode = localStorage.getItem("colorMode") as ColorMode;
        if (storedMode) {
            setMode(storedMode);
        } else {
            const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            setMode(systemPreference);
        }
    }, []);

    const setColorMode = () => {
        if (mode === "light") {
            setMode("dark");
            localStorage.setItem("colorMode", "dark");
        } else {
            setMode("light");
            localStorage.setItem("colorMode", "light");
        }
    };

    const toggleTheme = () => {
        setColorMode();
    };

    return (
        <ColorModeContext.Provider
            value={{
                setMode,
                mode,
                toggleTheme,
            }}
        >
            {children}
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => {
    const context = useContext(ColorModeContext);
    if (context === undefined) {
        throw new Error("useColorMode must be used within a ColorModeContextProvider");
    }
    return context;
}
