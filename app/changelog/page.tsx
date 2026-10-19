import { Typography, Card, CardContent, Box, Divider } from "@mui/material";
import { PageMetadata } from "@components/PageMetadata/PageMetadata";
import { RAINBOW_GRADIENT } from "@components/Buttons/RainbowCard";
import { CONTENT_WIDTH } from "@components/Theme/tokens";
import { CHANGELOG } from "@data/changelog";
import { formatDate } from "@util/stringManipulation";

const title = "Changelog";
const description = "A history of updates and changes to Wait, I'm Ramping!";
export const metadata = PageMetadata(title, description);

export default function ChangelogPage() {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2, mb: 4 }}>
            <Card
                variant="outlined"
                sx={{
                    maxWidth: CONTENT_WIDTH.wide,
                    width: { xs: "90%", sm: "90%", md: "100%" },
                    mx: "auto",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0, left: 0, right: 0,
                        height: "4px",
                        background: RAINBOW_GRADIENT,
                    },
                }}
            >
                <CardContent>
                    <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
                        Changelog
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {CHANGELOG.map((entry, i) => (
                            <Box key={i}>
                                <Box sx={{ display: "flex", gap: 3, py: 1.5 }}>
                                    <Typography variant="body2" color="text.disabled" sx={{ minWidth: 96, pt: 0.2, whiteSpace: "nowrap" }}>
                                        {formatDate(entry.date)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {entry.text}
                                    </Typography>
                                </Box>
                                {i < CHANGELOG.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
