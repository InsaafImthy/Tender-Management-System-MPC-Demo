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
        if (trigger) {
            trigger();
        }
    },[])


    return (
        <div className="app-surface-soft p-6">
            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div className="flex items-center space-x-6">
                       
                        <div>
                            <h1 className="text-heading-1 !font-semibold">
                                Hello <span className="text-violet-800 font-semibold">{getUserCredentials().name}</span>!
                            </h1>
                            <p className="text-body-large text-muted mt-2">Welcome to Procurement management system</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <CreateButton name="Create Tender" onClick={onCreateRequest} />
                        <PublishButton name="Publish Tenders" onClick={onPublishRfps} />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TitleCard

