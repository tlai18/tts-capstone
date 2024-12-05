import React from 'react'

interface Props{
    ip: string;
    setIP: React.Dispatch<React.SetStateAction<string>>;
    getData: (e: React.FormEvent) => void;
}

const UserDataForm: React.FC<Props> = ({ ip, setIP, getData }) => {
    return (
        <form className="input" onSubmit={getData}>
            <input
                type="input"
                value={ip}
                onChange={(e) => setIP(e.target.value)}
                placeholder="User"
                className="input_box"
            />
            <button className="input_submit" type="submit">Enter</button>
        </form>
    )
}

export default UserDataForm
