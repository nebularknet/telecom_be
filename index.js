import app from 'src/app';
const port = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
