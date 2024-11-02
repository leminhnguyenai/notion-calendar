import app from "./app";
export const PORT = 6060;

app.listen(PORT, () => {
    console.log(`The server is on http://localhost: ` + PORT);
});
