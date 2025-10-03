import React, { useState } from "react";
import userLogo from "../../assets/profile_photo/userPhoto.png"
interface Person {
  id: number;
  name: string;
  imageUrl: string;
}

interface PeoplePickerProps {
  users: Person[];
  value: Person[];
  setValue: (updated: Person[]) => void;
  placeholder?: string;
  label?: string;
  height?:string
}

const PeoplePicker: React.FC<PeoplePickerProps> = ({
  users,
  value,
  setValue,
  placeholder = "Search people...",
  label = "",
  height
}) => {
  const [search, setSearch] = useState("");
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);

    if (query.length > 0) {
        console.log(users);
      const filtered = users.filter(
        (person) =>
          person?.name?.toLowerCase().includes(query.toLowerCase()) &&
          !value.some((v) => v.id === person.id)
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople([]);
    }
  };

  const addPerson = (person: Person) => {
    const updated = [...value, person];
    setValue(updated);
    setSearch("");
    setFilteredPeople([]);
  };

  const removePerson = (id: number) => {
    const updated = value.filter((p) => p.id !== id);
    setValue(updated);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-2">{label} <span className="text-red-500">*</span></label>}

      <div className={`flex flex-wrap items-center border border-gray-300 rounded-md p-2 gap-2 ${ height ? `min-h-[${height}]` : "min-h-[48px]"}`}>
        {value.map((person) => (
          <div
            key={person.id}
            className="flex items-center bg-violet-100 rounded-full px-2 py-1 text-sm"
          >
            <img
              src={person.imageUrl || userLogo}
              alt={person.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-gray-800">{person.name}</span>
            <button
              className="ml-2 text-gray-600 hover:text-gray-900"
              onClick={() => removePerson(person.id)}
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder={placeholder}
          className="flex-1 border-none outline-none focus:ring-0 text-sm text-gray-800"
        />
      </div>

      {filteredPeople.length > 0 && (
        <ul className="mt-1 border border-t-0 border-gray-300 rounded-b-md max-h-40 overflow-y-auto bg-white shadow-md z-10 relative">
          {filteredPeople.map((person) => (
            <li
              key={person.id}
              onClick={() => addPerson(person)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              <img src={person.imageUrl || userLogo} alt={person.name} className="w-6 h-6 rounded-full" />
              {person.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PeoplePicker;
