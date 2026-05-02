import Background from "../../assets/background.png";



export const Layout = ({ children, bgUrl }: { children: React.ReactNode, bgUrl?: string }) => {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <div className="relative z-10 h-full">{children}</div>
      {/* <img src={Background} className="w-screen h-screen absolute top-0 left-0" /> */}
    </div>
  )
}