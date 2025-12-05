# Gmail AI Assistant Agent (Frontend)

A smart AI agent designed to interact with and manage Gmail inboxes. Built with **React**, **TailwindCSS** and **LangGraph** for stateful agent workflows and exposed via a **FastAPI** backend, this application can draft responses, Summarize threads, check your calendar before schedule meetings, yourself compose mail and reply to thread.

## Overview
This application made with Oauth authentication integrated your mails from Gmail API and manage your calendar with Google calendar API. 

My Backend(fastapi) has a data pipeline i created that gets the mails from Gmail API and neccessary data that i need to store in mongodb. This data pipeline helps me fetch mails from db to my dashboard with less latency compared to direct fetching from the GmailAPI. Setup a cronjob that automated fetching every few minutes to update the latest mails from Gmail API.

This application is based on 2 pages:
1.Simple google signin page helps to login with gmail account easily.
2.Dashboard Page consists list of mails, components like mail to compose yourself and agent modal and a signout option. Clickin on a certain mail open to its thread.

Agent: This application has the agent with the modal design view made with Langgraph agent used **Gemini 2.5 Flash** llm has a total of 6 tools that llm can judge to use for appropiate tasks. To know more about my agent open backend repository.

## Architecture
React front-end → FastAPI Backend → LangGraph Agent → Gmail + Calendar APIs → MongoDB (cron sync)

## Tech Stack
- **Reactjs**
- **TailwindCSS**
- **Lucide Icons**
- **OGL**: For rendering the dynamic Aurora background effect.
- **Axios**
- **Vite**





