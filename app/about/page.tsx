
import { Typography, Card, CardContent, Divider, Stack, Box } from "@mui/material";
import { PageMetadata } from "@components/PageMetadata/PageMetadata";
import { RAINBOW_GRADIENT } from "@components/Buttons/RainbowCard";
import { CONTENT_WIDTH, FONT } from "@components/Theme/tokens";

const title = "About";
const description = "Learn more about Swirl, the creator of Wait, I'm Ramping!";
export const metadata = PageMetadata(title, description);

const swirlImg = "/swirl_panda.jpg";
const mistweaverLogo = "/mistweaver-bad.png";

const imageStyle = {
  width: 128,
  height: 128,
  borderRadius: 1,
  objectFit: "cover",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
  border: "1px solid #575757",
  backgroundColor: "transparent",
  transition: "transform 0.3s ease",
};

const About = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <Card
        variant="outlined"
        sx={{
          maxWidth: CONTENT_WIDTH.narrow,
          width: { xs: "90%", sm: "90%", md: "100%" },
          mx: "auto",
          mt: 2,
          mb: { xs: 2, sm: 2 },
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: RAINBOW_GRADIENT,
          },
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" gutterBottom align="left" sx={{ mt: 1 }}>
              about me
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                component="img"
                src={swirlImg}
                alt="swirl"
                sx={{
                  ...imageStyle,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              />
              <Typography variant="body2" paragraph align="left" sx={{ mb: 0 }}>
                hi, i'm swirl :) i'm a gamer and software engineer who enjoys the mathematical side of the world, which translates directly into digging into how healing works across different games, mostly aligned with world of warcraft. i've been playing wow since cataclysm, and started maining mistweaver monk in mists of pandaria.
              </Typography>
            </Stack>

            <Box
              sx={{
                backgroundColor: "rgba(126, 229, 255, 0.08)",
                border: "1px solid rgba(126, 229, 255, 0.2)",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" paragraph align="left" sx={{ mb: 0 }}>
                  ever since, competitive healing has been a major focus in my gameplay. i've reached{" "}
                  <Box component="span" sx={{ color: "#ffd700", fontWeight: "bold" }}>
                    world rank 20 in raid
                  </Box>
                  , earned multiple{" "}
                  <Box component="span" sx={{ color: "#ff69b4", fontWeight: "bold" }}>
                    0.1% titles in mythic+
                  </Box>{" "}
                  season to season. on another note, i am the{" "}
                  <Box component="span" sx={{ color: "#89ff7f", fontWeight: "bold" }}>
                    mistweaver guide writer for wowhead
                  </Box>{" "}
                  and i'm currently a{" "}
                  <Box component="span" sx={{ color: "#7ee5ff", fontWeight: "bold" }}>
                    veteran and moderator in peak of serenity
                  </Box>
                  .{" "}
                  i love helping other healers improve and enjoy the role more!
                </Typography>
                <Box
                  component="img"
                  src={mistweaverLogo}
                  alt="mistweaver"
                  sx={{
                    ...imageStyle,
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                />
              </Stack>
            </Box>

            <Divider
              sx={{
                position: "relative",
                left: "50%",
                right: "50%",
                width: "calc(100% + 32px)",
                transform: "translateX(-50%)",
                my: 2,
                mx: 0,
                "&::before": {
                  content: '"𖦹"',
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "background.paper",
                  px: 2,
                  color: "text.secondary",
                  fontSize: FONT.subhead,
                },
              }}
            />

            <Typography variant="h4" gutterBottom align="left">
              about this project
            </Typography>
            <Typography variant="body2" paragraph align="left">
              <Box component="span" sx={{ color: "primary.main", fontWeight: "bold" }}>
                𖦹 wait, i'm ramping!
              </Box>{" "}
              is a site full of tools to help world of warcraft healers plan, visualize, and fine-tune their healing. it includes various components such as a ramp timer calculator, a spell timeline visualizer, many tools that compare spells and cooldowns (that i've implemented :p), and much more.
            </Typography>
            <Typography variant="body2" paragraph align="left">
              honestly, i started this website as a way to learn react which turned into much more: a method to share useful info for planning and optimizing healing - whether you're trying to clean up your sequencing, or satiate the desire to understand your spells a bit better.
            </Typography>
            <Typography variant="body2" paragraph align="left">
              this site is <Box component="span" sx={{ fontWeight: "bold" }}>free and open source</Box>. 
              if you're interested in contributing or just want to chat about theorycrafting, feel free to reach out through any of the social links in the footer below!
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;