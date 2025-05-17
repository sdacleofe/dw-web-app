<<<<<<< HEAD
# dw-web-app
=======
# Data Warehouse Web App

A Laravel + Vue 3 application for browsing, querying, and exporting data from a PostgreSQL data warehouse.

## Features

-   Browse database tables by category
-   Preview table data with pagination
-   Run simple SQL SELECT queries (no JOINs, UNIONs, or destructive queries)
-   Download table data as CSV
-   Responsive, modern UI

## Requirements

-   PHP 8.1+
-   Composer
-   Node.js & npm
-   PostgreSQL

## Setup

1. **Clone the repository**

    ```sh
    git clone https://github.com/sdacleofe/dw-web-app.git
    cd dw-web-app
    ```

2. **Install PHP dependencies**

    ```sh
    composer install
    ```

3. **Install JavaScript dependencies**

    ```sh
    npm install
    ```

4. **Copy and configure environment file**

    ```sh
    cp .env.example .env
    ```

    - Set your database credentials in `.env`

5. **Run migrations**

    ```sh
    php artisan migrate
    ```

6. **Start the development servers**

    ```sh
    php artisan serve
    npm run dev
    ```

7. **Visit the app**
    - Open [http://localhost:8000](http://localhost:8000) in your browser

## Usage

-   Select a table from the sidebar to preview data.
-   Use the SQL editor to run simple `SELECT` queries.
-   Download data as CSV using the download button.

## Security

-   Only simple SELECT queries are allowed.
-   Queries with JOIN, UNION, or destructive statements are blocked.
