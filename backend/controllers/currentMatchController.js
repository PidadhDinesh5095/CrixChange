import axios from 'axios';

import dotenv from 'dotenv';
dotenv.config();
const options = {
  method: 'GET',
  url: process.env.SPORTS_API_URL,
  headers: {
    'x-rapidapi-key': process.env.SPORTS_API_KEY,
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

export const getCurrentMatches = async (req, res) => {
  console.log('Fetching current matches from external API...');

  try {
    const response = await axios.request(options);
    const data = response.data;

    const matches = [];

    data.typeMatches.forEach(type => {
      if (type.matchType === "League") {
        type.seriesMatches.forEach(series => {
          const wrapper = series.seriesAdWrapper;

          if (
            wrapper &&
            wrapper.seriesName &&
            wrapper.seriesName.toLowerCase().includes("indian premier league")
          ) {
            wrapper.matches.forEach(m => {
              const info = m.matchInfo;

              // Convert timestamp → IST
              const dateObj = new Date(Number(info.startDate));

              const date = dateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              });

              const time = dateObj.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              });

              matches.push({
                id: info.matchId,
                match: `${info.team1.teamSName} vs ${info.team2.teamSName}`,
                team1: info.team1.teamSName,
                team2: info.team2.teamSName,
                date,
                time,
                venue: info.venueInfo.city,
                ground: info.venueInfo.ground,
                status: info.state
              });
            });
          }
        });
      }
    });

    res.status(200).json(
        {
            succes:true,
            message:"Current matches retrieved successfully",

            matches
        }
    );
    console.log('Matches retrieved:', matches);
    
        
    

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching current matches',
      error: error.message
    });
  }
};

