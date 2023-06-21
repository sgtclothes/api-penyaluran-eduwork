const { google } = require('googleapis');
const keys = require('./gsheet-389908-28f5c0bc03c8.json');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const auth = new google.auth.GoogleAuth({
    credentials: keys,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function convertJsonToCsv(data, outputPath) {
    // Define the CSV writer and specify the header based on the keys of the first object
    const csvWriter = createCsvWriter({
        path: outputPath,
        header: Object.keys(data[0]).map(key => ({ id: key, title: key })),
        fieldDelimiter: ',',
        alwaysQuote: true,
    });

    let expect = [
        'portals',
        'registrants_students',
        'penyaluran_submits'
    ];

    data.forEach((d, i) => {
        for (let key in d) {
            if (expect.includes(key)) {
                data[i][key] = "";
            }
        }
    });

    // Write the data to the CSV file
    await csvWriter.writeRecords(data);
    console.log('JSON data converted to CSV successfully!');
}

const updatePenyaluranSubmit = async () => {
    try {

        const response = await fetch('https://eduwork.id/api/penyaluran/list', {
            headers: {
                Authorization: 'Bearer N0J0NTZxTGszRzJBOXNOOEpoUjFVMHJWeVA0Zll0TzVEZVg3VzZaYUMzQjJUNHNOOEpoUjFVMHJWeVA0Zll0TzU=',
            },
        });
        const data = await response.json();

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '11z_zReOODiqyumszWRtnMzDTJJqfRaLybrJfoabSmb4';

        fs.writeFileSync('data.json', data);
        console.log('JSON file created successfully!');
        const jsonData = fs.readFileSync('data.json', 'utf-8');
        const range = 'Sheet1!A1'; // Replace with the desired range in the sheet

        const values = JSON.parse(jsonData);
        let vals = [];
        values.forEach(v => {
            v.penyaluran_submits.forEach(s => {
                vals.push(s);
            });
        });

        const headers = Object.keys(vals[0]);
        const dataValues = vals.map((row) => Object.values(row));

        const resource = {
            values: [headers, ...dataValues]
        };

        sheets.spreadsheets.values.update(
            {
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                resource,
            },
            (err, response) => {
                if (err) {
                    console.error('Error setting values:', err);
                    return;
                }
                console.log('Values set successfully:', response.data);
            }
        );
    } catch (err) {
        console.error('Error reading Google Sheet:', err);
    }
};

updatePenyaluranSubmit();
