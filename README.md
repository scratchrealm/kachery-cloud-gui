# kachery-cloud-gui

This is the web app and serverless API associated with [kachery-cloud](https://github.com/flatironinstitute/kachery-cloud). It is deployed on vercel at cloud.kacheryhub.org.

The following services are used:
* pubnub
* google firestore
* google authentication
* recaptcha

The following environment variables need to be set on vercel.

```
DEFAULT_BUCKET_ID
REACT_APP_ADMIN_USERS
PUBNUB_UUID
PUBNUB_SECRET_KEY
PUBNUB_PUBLISH_KEY
PUBNUB_SUBSCRIBE_KEY
REACT_APP_GOOGLE_API_KEY
REACT_APP_GOOGLE_CLIENT_ID
GOOGLE_CREDENTIALS
RECAPTCHA_SECRET_KEY
REACT_APP_RECAPTCHA_KEY
```

The following composite index needs to be created on the firestore database
```
kacherycloud.files	uri: ASC timestampCreated: ASC	Collection
```

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
