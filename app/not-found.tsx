"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { RAINBOW_GRADIENT } from "@components/Buttons/RainbowCard";
import SwirlButton from "@components/Buttons/SwirlButton";
import SpellLink from "@components/SpellLink/SpellLink";
import SPELLS from "@data/spells";
import { FONT } from "@components/Theme/tokens";

const S = (spell: (typeof SPELLS)[keyof typeof SPELLS]) => <SpellLink spell={spell} sx={{ marginTop: -0.5 }} />;

const MESSAGES: React.ReactNode[] = [
    // disc
    <>probably got {S(SPELLS.SMITE)}d to death</>,
    <>{S(SPELLS.POWER_WORD_SHIELD)} got dispelled</>,
    <>accidentally defensive {S(SPELLS.PENANCE)}d (lol)</>,
    <>{S(SPELLS.PAIN_SUPPRESSION)} was on cooldown</>,
    // hpriest
    <>ouch, one shot through {S(SPELLS.GUARDIAN_SPIRIT)}</>,
    <>even {S(SPELLS.PRAYER_OF_HEALING)} couldn't fix this</>,
    <>{S(SPELLS.RENEW)} fell off</>,
    // mw
    <>accidentally {S(SPELLS.TRANSCENDENCE_TRANSFER)}ed into a swirly</>,
    <>{S(SPELLS.VIVIFY)} cleaved onto exactly 0 players</>,
    <>{S(SPELLS.REVIVAL)} dispelled this entire page</>,
    <>no {S(SPELLS.REVIVAL)} for 404s</>,
    <>{S(SPELLS.LIFE_COCOON)} absorbed one melee hit on the tank</>,
    <>this page is {S(SPELLS.DISABLE)}d</>,
    // rdruid
    <>spammed {S(SPELLS.REJUVENATION)} to oom</>,
    <>{S(SPELLS.TRANQUILITY)} cancelled by a loading bar</>,
    <>accidentally {S(SPELLS.CONVOKE_THE_SPIRITS)}'d in bear form</>,
    <>{S(SPELLS.INCARNATION_TREE_OF_LIFE)} didn't grow here</>,
    // rsham
    <>{S(SPELLS.HEALING_TIDE_TOTEM)}'s healed for 0.0404 instead of 404k, oops!</>,
    <>didn't have an external except for {S(SPELLS.EARTH_SHIELD)}</>,
    <>{S(SPELLS.CHAIN_HEAL)} bounced past this page</>,
    <>dropped {S(SPELLS.SPIRIT_LINK_TOTEM)} and redistributed this page out of existence</>,
    // hpal
    <>cast one {S(SPELLS.HOLY_LIGHT)} and went oom</>,
    <>tried {S(SPELLS.LAY_ON_HANDS)}, had 404-bearance (haha, get it, {S(SPELLS.FORBEARANCE)})</>,
    <>{S(SPELLS.AURA_MASTERY)} reduced to 0% damage reduction</>,
    <>accidentally had {S(SPELLS.CRUSADER_AURA)} on</>,
    <>got {S(SPELLS.DIVINE_SHIELD)}ed from existence</>,
    // pres
    <>accidentally {S(SPELLS.HOVER)}ed into a frontal</>,
    <>{S(SPELLS.STASIS)} triple dispelled this page</>,
    <>{S(SPELLS.DREAM_BREATH)} only had 25 yard range, 404 yards required</>,
];

const NotFound: React.FC = () => {
    const [message, setMessage] = useState<React.ReactNode>(null);
    useEffect(() => {
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 3, textAlign: "center", px: 2 }}>
            <Box
                component="img"
                src="/mistweaver-bad.png"
                alt="mistweaver"
                sx={{
                    width: 180,
                    height: 180,
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1px solid #575757",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.05)" },
                }}
            />
            <Box>
                <Typography variant="h1" sx={{ fontWeight: "bold", fontSize: "3em", lineHeight: 1.1, mb: 0.5 }}>
                    404
                </Typography>
                <Box sx={{ height: 2, borderRadius: 1, background: RAINBOW_GRADIENT, mb: 1.5, mx: "auto" }} />
                {message
                    ? <Typography component="div" sx={{ fontSize: FONT.subhead, color: "text.secondary", mb: 2 }}>{message}.</Typography>
                    : <Skeleton variant="text" width={280} height={24} sx={{ mx: "auto", mb: 2 }} />
                }
                <SwirlButton href="/">
                    Home
                </SwirlButton>
            </Box>
        </Box>
    );
};

export default NotFound;
