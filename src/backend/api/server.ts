import app from "./app";
const PORT = 6060;

app.listen(PORT, () => {
    console.log(`The API is live on http://localhost:${PORT}`);
});
