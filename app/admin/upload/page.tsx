import PortfolioAdmin from "./PortfolioAdmin";

  const nameApp=process.env.NEXT_PULIC_NAME_APP

export default function UploadPhoto(){
    return (<PortfolioAdmin nameApp={nameApp}/>)
}