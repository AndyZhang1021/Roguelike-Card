import { useGameStore } from "../../stores/game-store.ts"
import type { Card } from "../../types/game.ts"
import { Box } from "@mui/material";
import Background from "../../assets/entry-background.png";

const EntryScreen = () => {

  return (
    <Box>
      <img src={Background} alt="background" className="w-screen h-screen" />
    </Box>
  )
}

export default EntryScreen;