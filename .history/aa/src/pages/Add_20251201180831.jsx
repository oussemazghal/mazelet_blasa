import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./add.css";

export default function Add() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type_match: "",
        city: "",
        stadium: "",
        date: "",
        start_time: "",
        end_time: "",
        nb_players: "",
        price_per_player: "",
        organizer_phone: "",
        min_age: "",
        max_age: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to create a match");
            navigate("/login");
            return;
        }
        try {
            const res = await fetch("http://127.0.0.1:8001/matches/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Match created successfully!");
                navigate("/games");
            } else {
                const err = await res.json();
                alert("Failed to create match: " + (err.detail || "unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Error creating match");
        }
    };

    return (
        <div className="add-page">
            <h2>Create a New Match</h2>
            <form className="add-form" onSubmit={handleSubmit}>
                <label>Title
                    <input name="title" value={formData.title} onChange={handleChange} required />
                </label>
                <label>Description
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>
                <label>Type
                    <input name="type_match" value={formData.type_match} onChange={handleChange} required />
                </label>
                <label>City
                    <input name="city" value={formData.city} onChange={handleChange} required />
                </label>
                <label>Stadium
                    <input name="stadium" value={formData.stadium} onChange={handleChange} required />
                </label>
                <label>Date
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </label>
                <label>Start Time
                    <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
                </label>
                <label>End Time
                    <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
                </label>
                <label>Number of Players
                    <input type="number" name="nb_players" value={formData.nb_players} onChange={handleChange} required />
                </label>
                <label>Price per Player
                    <input type="number" step="0.01" name="price_per_player" value={formData.price_per_player} onChange={handleChange} required />
                </label>
                <label>Organizer Phone
                    <input name="organizer_phone" value={formData.organizer_phone} onChange={handleChange} required />
                </label>
                <label>Min Age
                    <input type="number" name="min_age" value={formData.min_age} onChange={handleChange} required />
                </label>
                <label>Max Age
                    <input type="number" name="max_age" value={formData.max_age} onChange={handleChange} required />
                </label>
                <button type="submit" className="btn-submit">Create Match</button>
            </form>
        </div>
    );
}
