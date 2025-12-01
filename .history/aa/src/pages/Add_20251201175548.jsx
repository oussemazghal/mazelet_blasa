import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tunisianCities } from "../constants";
import "./add.css";

export default function Add() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        type_match: "5v5",
        city: "Tunis",
        stadium: "",
        date: "",
        start_time: "",
        end_time: "",
        nb_players: 10,
        price_per_player: 0,
        organizer_phone: "",
        description: "",
        min_age: 0,
        max_age: 100
    });

    // Load user phone if available
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://127.0.0.1:8001/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.phone) {
                        setFormData(prev => ({ ...prev, organizer_phone: data.phone }));
                    }
                })
                .catch(err => console.error(err));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first");
            navigate("/signin");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8001/matches/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Match created successfully!");
                navigate("/games");
            } else {
                const error = await res.json();
                alert("Error: " + JSON.stringify(error));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create match");
        }
    };

    return (
        <div className="add-page">
            <div className="add-container">
                <h1>Create a New Match</h1>
                <form onSubmit={handleSubmit} className="add-form">

                    <div className="form-group">
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Match amical" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select name="type_match" value={formData.type_match} onChange={handleChange}>
                                <option value="5v5">5v5</option>
                                <option value="7v7">7v7</option>
                                <option value="9v9">9v9</option>
                                <option value="11v11">11v11</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Players Needed</label>
                            <input type="number" name="nb_players" value={formData.nb_players} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <select name="city" value={formData.city} onChange={handleChange}>
                                {Object.keys(tunisianCities).map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Stadium</label>
                            <select name="stadium" value={formData.stadium} onChange={handleChange} required>
                                <option value="">Select Stadium</option>
                                {tunisianCities[formData.city]?.map(stadium => (
                                    <option key={stadium} value={stadium}>{stadium}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Price (DT)</label>
                            <input type="number" name="price_per_player" value={formData.price_per_player} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Age</label>
                            <input type="number" name="min_age" value={formData.min_age} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Max Age</label>
                            <input type="number" name="max_age" value={formData.max_age} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="organizer_phone" value={formData.organizer_phone} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Create Match</button>
                </form>
            </div>
        </div>
    );
}
