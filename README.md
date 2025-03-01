# Goal Peering Frontend

This repository contains the **frontend** for the "Goal Peering" app, built using **React Native** and **Expo**. It provides an interface to list, search, create, and join "goals" as well as sharing experiance through tip and success story sharing or chatting in a group dedicated for the goal. One can also look at group progress and also record on complete. The app can be run on a real device or simulator, scanning a QR code to preview via Expo.

## Table of Contents

1. [Overview](#1-overview)  
2. [Environment Variables](#2-environment-variables)  
3. [Setup & Installation](#3-setup--installation)  

---

## 1. Overview

The **Goal Peering** frontend is built with **React Native** + **Expo** to provide a mobile interface for:

- User Authentication (JWT)  
- Creating, listing, searching, joining goals  
- Update and viewing progress for each goals
- Engagge ina  chat grioup created for the peer

It communicates with the **backend** (see [the backend repo](https://github.com/Kidist-Abraham/GoalPeeringApi)). This README explains how to install, configure, and run the app—particularly via the **Expo** QR code approach for easy testing on real devices.

---

## 2. Environment Variables

You can configure environment variables by editing the `app.config.js` file. Edit the API_BASE_URL and FRONTED_BASE_URL.

### Example of `app.config.js`
```js
export default ({ config }) => ({
    ...config,
    extra: {
      API_BASE_URL: "http://192.168.109.195:3000",
      FRONTED_BASE_URL: "http://192.168.109.195:8081"
    },
  });
```
The ip address is your machine’s IP address. It can for example be retrieved using the command `ipconfig getifaddr en0`. Use this ip if you’re on the same machine as the backend.

## 3. Setup & Installation

Clone the repo:

```bash
git clone https://github.com/Kidist-Abraham/GoalPeering.git
cd GoalPeering
```

Install dependencies:

```bash
npm install
```


Run the Expo dev server:

```bash
npx expo start
```


When you run `npx expo start`, Expo CLI will open a terminal/Metro bundler interface showing a QR code.

-> Install the [Expo Go](https://expo.dev/go) app on your mobile device (iOS or Android).

-> Ensure your device is on the same Wi-Fi network as your development machine so that the app can have access to the backed throught the ip retrieved by `ipconfig getifaddr en0`

-> Scan the QR code displayed in your terminal or web interface using the Expo Go app.

-> The app will load on your real device—any changes you make in the code will auto-refresh.

