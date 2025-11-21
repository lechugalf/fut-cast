export type LocationForecastRequest = {
    latitude: number;
    longitude: number;
    date: string;
};

export type LocationForecastResponse = {
    latitude: number;
    longitude: number;
    hourly: {
        time: string[];
        precipitation: number[];
        precipitation_probability: number[];
        rain: number[];
        showers: number[];
        snowfall: number[];
        weather_code: number[];
        temperature_2m: number[];
        relative_humidity_2m: number[];
        dew_point_2m: number[];
        apparent_temperature: number[];
        wind_speed_10m: number[];
    };
};
