import ChatGPTWrapper from './chatGptWrapper.js';
import express from 'express';
import { join } from 'path';
import { getImagesData, db } from './firebase.js'; // Import db

const app = express();

// Function to check images using Visia Open AI Model and update Firestore
const checkIA = (response) => {

    // Get images data from Firebase Firestore
    getImagesData().then(pictures => {
        const updatePromises = pictures.map(picture => {
            const { imageUrl, safe } = picture;
            console.log(`image Url: ${imageUrl}, Safe: ${safe}`);

            // Generate a prompt for each image
            return new ChatGPTWrapper().generatePrompt(
                "C'est une capture d'écran, répond par oui ou par non si cette image représente du contenu choquant, de type harcèlement, insultant, offensant ou sensible.",
                imageUrl
            )

            .then(promptResponse => {
                // Determine the new 'safe' value based on ChatGPT's response
                const newSafeValue = promptResponse.includes("Oui") ? false : true;
                console.log("Updated safe value:", newSafeValue);

                // Update Firestore document with the new 'safe' value
                return db().collection('images').doc(picture.id).update({ safe: newSafeValue })
                    .then(() => {
                        console.log(`Document with ID ${picture.id} updated with new 'safe' value: ${newSafeValue}`);
                    });
            });
        });

        // Once all updates are done, send response to the client
        return Promise.all(updatePromises);
    })
    .then(() => {
        if (response) {
            response.status(200).send("Documents updated successfully");
        }

	setTimeout(() => checkIA(), 1000);
	
    })
    .catch(error => {
        console.error('Error getting or updating documents: ', error);
        if (response) {
            response.status(500).send('Error processing images');
        }
    });
};

// /index page - Main logic for processing images
app.get('/', function (request, response) {

});

// Other routes
app.get('/home', function (request, response) {
    response.sendFile('home.html', { root: join(__dirname, './views') });
});
app.get('/about', function (request, response) {
    response.sendFile('about.html', { root: join(__dirname, './views') });
});

// Start the server
app.listen(3000, function () {
    console.log('Listening at port 3000...');
    
    checkIA();
});

export default app;
