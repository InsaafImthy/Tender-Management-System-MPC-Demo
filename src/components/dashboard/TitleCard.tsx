import CreateButton, { PublishButton } from "../buttons/CreateButton";
import { useNavigate } from "react-router-dom";
import { getUserCredentials } from "../../utils/common";
import { useEffect } from "react";

const TitleCard = ({ trigger }: { trigger: () => void }) => {
    const navigate = useNavigate();
    const onCreateRequest = () => {
        navigate("/rfps/create-rfp")
    }

    const onPublishRfps = () => {
        navigate("/rfps/publish-rfps")
    }

    useEffect(()=>{
        trigger && trigger();
    },[])


    return (
        <div className="">
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
                    <div className="flex items-center space-x-6">
                       
                        <div>
                            <h1 className="text-heading-1 !font-semibold">
                                Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">{getUserCredentials().name}</span>!
                            </h1>
                            <p className="text-body-large text-muted mt-2">Welcome to Procurement management system</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <CreateButton name="Create RFP" onClick={onCreateRequest} />
                        <PublishButton name="Publish RFPs" onClick={onPublishRfps} />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TitleCard

