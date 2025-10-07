# Ongil-like Custom AI Agent (Alpha, Node 22 + MySQL + React)

**Backend:** Node 22 (Express), MySQL (`mysql2`)  
**Frontend:** React + Vite  
**Agents:** qna, proposal, dataHarmonizer, esg, forecasting  
**Connectors:** Generic REST (ERP/CRM) via `.env` (ERP_BASE_URL, ERP_API_KEY)

## Run (Windows Command Prompt)

### 0) MySQL (first time only)
Create DB & user (adjust password if you like):
```sql
CREATE DATABASE ongil_agent CHARACTER SET utf8mb4;
CREATE USER 'ongil'@'localhost' IDENTIFIED BY 'ongil123!';
GRANT ALL PRIVILEGES ON ongil_agent.* TO 'ongil'@'localhost';
FLUSH PRIVILEGES;
