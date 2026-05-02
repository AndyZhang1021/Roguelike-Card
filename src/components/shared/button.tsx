import ButtonImg from "../../assets/button.png";



export const Button = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  return (
    <button type="button" className={`${className} relative overflow-hidden`} onClick={onClick}>
      <div className="relative z-10">{children}</div>
      <img src={ButtonImg} className="h-full w-full absolute top-0 left-0 object-contain" />
    </button>
  )
}