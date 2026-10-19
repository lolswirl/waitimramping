import type React from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";

export const DiscordSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
    </svg>
);

export const TwitchSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
    </svg>
);

export const WarcraftSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width={24} height={24} viewBox="-4 -5 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M11.006 14.4441L16.2435 36.9715C16.3769 37.9556 15.6204 38.8913 14.8732 39.7328H23.256C22.941 38.9212 22.6628 38.1855 22.6651 37.2497L24.4723 29.0255C24.9988 31.4857 25.4954 33.9159 26.0288 36.3783C26.3392 37.4957 26.1438 38.7419 25.6771 39.7305H34.0162C33.5793 38.9557 32.9126 37.8406 33.0712 36.6565L36.3407 16.7755C36.904 14.9706 37.8673 13.3175 38.9594 11.761C36.2786 11.7955 33.4736 11.6966 30.8893 11.8254C31.917 12.7887 31.202 14.3453 31.1077 15.4995L28.643 30.4533C28.6108 30.4234 28.5533 30.3913 28.5832 30.297L24.3113 13.4693C22.787 19.0241 21.6949 24.7192 20.0441 30.2372L19.982 30.1406L16.8367 15.0603L16.9907 11.7633H9.04248C10.0748 12.2921 10.6312 13.4486 11.006 14.4395V14.4441Z" fill="currentColor"/>
        <path d="M8.4058 42.2383C12.5995 45.8296 18.0486 47.9954 23.9988 48C29.956 48 35.4028 45.8273 39.5942 42.2383H44.8018V35.9753C46.8297 32.4506 48 28.3604 48 23.9989C48 19.6396 46.832 15.5494 44.8018 12.0201V5.75945H39.5942C35.4005 2.17273 29.9537 0 24.0012 0C18.0486 0 12.5949 2.17273 8.40351 5.75945H3.20046V12.0201C1.16339 15.5448 0 19.635 0 23.9989C0 28.3627 1.16339 32.4506 3.20046 35.9776V42.2383H8.4058ZM23.9988 3.60052C35.2648 3.60052 44.3972 12.7352 44.3972 23.9989C44.3972 35.2648 35.2648 44.3995 24.0012 44.3995C12.7375 44.3995 3.60282 35.2648 3.59822 23.9989C3.60282 12.7352 12.7375 3.60052 23.9988 3.60052Z" fill="currentColor"/>
    </svg>
);

export const PatreonSVG = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M14.82 2.41C11.57 2.41 8.93 5.05 8.93 8.3c0 3.24 2.64 5.88 5.89 5.88 3.24 0 5.88-2.64 5.88-5.88 0-3.25-2.64-5.89-5.88-5.89M3.1 21.59h3.16V2.41H3.1z"/>
    </svg>
);

export interface SocialLink {
    label: string;
    href: string;
    icon: React.ReactNode;
    color: string;
}

export const SOCIAL_LINKS = {
    GITHUB: {
        label: "GitHub",
        href: "https://github.com/lolswirl/waitimramping",
        icon: <GitHubIcon />,
        color: "#ffffff",
    },
    DISCORD: {
        label: "Discord",
        href: "https://discord.gg/ZU5rhXtbNd",
        icon: <DiscordSVG />,
        color: "#5865F2",
    },
    PATREON: {
        label: "Patreon",
        href: "https://patreon.com/lolswirl",
        icon: <PatreonSVG />,
        color: "#FF424D",
    },
    TWITCH: {
        label: "Twitch",
        href: "https://www.twitch.tv/lolswirl",
        icon: <TwitchSVG />,
        color: "#9146FF",
    },
    YOUTUBE: {
        label: "YouTube",
        href: "https://www.youtube.com/@swirlstreams",
        icon: <YouTubeIcon />,
        color: "#d02424",
    },
    WARCRAFT: {
        label: "World of Warcraft",
        href: "https://raider.io/characters/us/illidan/Swirl",
        icon: <WarcraftSVG />,
        color: "#715beb",
    },
} satisfies Record<string, SocialLink>;
