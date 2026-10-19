"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useBranchName, useIsNonProd } from "@lib/betaModeClient";
import SwirlButton from "@components/Buttons/SwirlButton";
import { NavIconButton } from "@components/Buttons/NavIconButton";
import { GlassBox } from "@components/Glass";
import { RAINBOW_GRADIENT } from "@components/Buttons/RainbowCard";
import { BLUR, SECTIONS } from "@components/Theme/tokens";

// the logo links home
const NAV_SECTIONS = SECTIONS.filter(section => section.path !== "/");

function ResponsiveAppBar() {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [titleHovered, setTitleHovered] = React.useState(false);
    const isNonProd = useIsNonProd();
    const branchName = useBranchName();
    const displayBranch = isNonProd && branchName ? ` [${branchName}]` : "";
    const isHomePage = pathname === "/";

    const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);

    // sidebar drawer for mobile
    const drawer = (
        <Box
            sx={{ 
                width: 280, 
                display: "flex", 
                flexDirection: "column", 
                height: "100%",
                bgcolor: "#171717",
                borderLeft: "1px solid",
                borderColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "-4px 0 16px rgba(0, 0, 0, 0.3)",
            }}
            role="presentation"
        >
            <Box sx={{ 
                px: 2,
                py: 1,
                display: "flex",
                justifyContent: "flex-end",
                borderBottom: "1px solid",
                borderColor: "rgba(255,255,255,0.1)"
            }}>
                <NavIconButton
                    onClick={handleDrawerToggle}
                    size="small"
                    hoverColor="#ef4444"
                >
                    ✕
                </NavIconButton>
            </Box>

            {/* mobile nav */}
            <List sx={{ px: 1, py: 2 }}>
                {NAV_SECTIONS.map(({ label, path, color }) => {
                    const isActive = path === "/"
                        ? pathname === path
                        : pathname?.startsWith(path);
                    const buttonColor = color;

                    return (
                        <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton 
                                component="a" 
                                href={path} 
                                selected={isActive}
                                onClick={handleDrawerToggle}
                                sx={{
                                    mx: 1,
                                    position: "relative",
                                    color: "white",
                                    width: 'fit-content',
                                    minWidth: 'auto',
                                    flex: 'none',
                                    '&.MuiListItemButton-root': {
                                        width: 'fit-content',
                                        minWidth: 'auto',
                                        flex: 'none',
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                            bgcolor: 'transparent',
                                        }
                                    },
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: 0,
                                        left: 8,
                                        right: 8,
                                        height: 2,
                                        bgcolor: buttonColor,
                                        borderColor: "transparent",
                                        transform: isActive ? "scaleX(1)" : "scaleX(0)",
                                        transition: "transform 0.3s ease",
                                        zIndex: 2,
                                    },
                                    '&:hover': {
                                        bgcolor: 'transparent',
                                        "&::after": {
                                            transform: "scaleX(1)",
                                        }
                                    }
                                }}
                            >
                                <ListItemText 
                                    primary={label}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    height: 48,
                    minHeight: 48,
                    mb: 3.5,
                    justifyContent: "center",
                    backgroundImage: "none",
                    bgcolor: "#171717d9",
                    backdropFilter: BLUR.bar,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        variant="dense"
                        sx={{
                            height: 48,
                        }}
                    >
                        <Typography
                            variant="h5"
                            component="a"
                            href="/"
                            onMouseEnter={() => setTitleHovered(true)}
                            onMouseLeave={() => setTitleHovered(false)}
                            sx={{
                                mr: 2,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontWeight: 700,
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                                fontSize: { xs: "1.05rem", md: "1.3rem" },
                                color: "white",
                                "&:hover": {
                                    opacity: 0.7,
                                },
                            }}
                        >
                            <img src="/apple-icon.png" alt="Logo" style={{ width: 20, height: 20, transform: 'translateY(1px)' }} />
                            {!isHomePage && (
                                <span style={{
                                    background: titleHovered ? RAINBOW_GRADIENT : "none",
                                    WebkitBackgroundClip: titleHovered ? "text" : "unset",
                                    WebkitTextFillColor: titleHovered ? "transparent" : "white",
                                    backgroundClip: titleHovered ? "text" : "unset",
                                    transition: "all 0.3s ease",
                                }}>
                                    Wait, I'm Ramping!
                                </span>
                            )}
                            {displayBranch && (
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: { xs: "0.65rem", md: "0.75rem" },
                                        fontWeight: 500,
                                        lineHeight: 1,
                                        transform: "translateY(1px)",
                                        color: "rgba(255,255,255,0.7)",
                                    }}
                                >
                                    {displayBranch}
                                </Typography>
                            )}
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        {/* desktop navigation */}
                        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, mb: "-2px" }}>
                            {NAV_SECTIONS.map(({ label, path, color }) => {
                                const isActive = path === "/"
                                    ? pathname === path
                                    : pathname?.startsWith(path);

                                return (
                                    <SwirlButton
                                        key={label}
                                        variant="nav"
                                        href={path}
                                        selected={isActive}
                                        color={color}
                                    >
                                        {label}
                                    </SwirlButton>
                                );
                            })}
                        </Box>

                        {/* mobile menu button */}
                        <GlassBox showOnDesktop={false}>
                            <NavIconButton
                                onClick={handleDrawerToggle}
                                size="small"
                                hoverColor="#60a5fa"
                            >
                                <MenuIcon sx={{ fontSize: 20 }} />
                            </NavIconButton>
                        </GlassBox>
                    </Toolbar>
                </Container>
            </AppBar>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default ResponsiveAppBar;