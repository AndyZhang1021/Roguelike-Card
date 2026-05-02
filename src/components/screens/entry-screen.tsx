
import Background from "../../assets/background.png";
import StartButton from "../../assets/start-button.png";
import { useGameStore } from "../../stores/game-store";

const EntryScreen = () => {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div style={{ background: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
      className="w-screen h-screen">
        <div className="flex items-center justify-center w-full h-full">
          <button className="bg-white rounded shadow-2xl hover:shadow-sm" onClick={() => setScreen("map")}>Start</button>
          {/* <button type="button" className="w-64 cursor-pointer shadow-2xl hover:shadow-sm" onClick={() => console.log('start')}>
            <img src={StartButton} className="w-full object-contain" />
          </button> */}
        </div>
    </div>
  )
}

export default EntryScreen;