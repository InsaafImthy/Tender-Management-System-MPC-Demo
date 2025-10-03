import { DatePicker } from 'antd';
import dayjs from 'dayjs';

interface IDateTimePicker {
    id?:string;
    label: string;
    value: string;
    setValue: (val: string) => void;
    required?:boolean;
    format?:string;
}

export default function DateTimePicker({id, label, value, setValue ,required = false, format}: IDateTimePicker) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-2">{label} <span className="text-red-500">*</span></label>
            <DatePicker
                id={id || undefined}
                required={required}
                showTime={{ use12Hours: true }}
                value={value ? dayjs(value) : null}
                onChange={(val) => {
                    if (val) setValue(val.toISOString());
                    else setValue('');
                }}
                format={format ? format :"YYYY-MM-DD hh:mm A"} // Note lowercase `hh` and uppercase `A`
                className="w-full p-2"
                placeholder="Select date & time"
            />
        </div>
    );
}
