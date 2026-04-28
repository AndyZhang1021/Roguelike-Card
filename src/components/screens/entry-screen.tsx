import { useGameStore } from "../../stores/game-store.ts"
import type { Card } from "../../types/game.ts"
import { Box } from "@mui/material";
import Background from "../../assets/entry-background.png";
import StartButton from "../../assets/start-button.png";

const EntryScreen = () => {

  return (
    <Box sx={{ background: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      className="w-screen h-screen">
        <Box className="flex items-center justify-center w-full h-full">
          <button type="button" className="w-64 cursor-pointer" onClick={() => console.log('start')}>
            <img src={StartButton} className="w-full object-contain" />
          </button>
        </Box>
    </Box>
  )
}

export default EntryScreen;