import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
export default function DonationForm ({mode}){
    return(
        <div className="form">
            {mode === "named" && (<InputField label = "Your Name"/>

            )}
            <InputField label="Amount" type="number" />
            <InputField label="Message Optional"/>
            <PrimaryButton text="DonateNow"></PrimaryButton>
        </div>
    )
}