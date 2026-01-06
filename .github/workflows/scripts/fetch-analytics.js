const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');
const path = require('path');

async function fetchAnalyticsData() {
  try {
    // Initialize the Google Analytics Data API client
    const analyticsDataClient = new BetaAnalyticsDataClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: 'credentials.json'
    });

    const propertyId = process.env.ANALYTICS_PROPERTY_ID;

    // Fetch data for the last 7 days
    const response = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
        {
          name: 'eventCount',
        },
        {
          name: 'screenPageViews',
        },
      ],
      dimensions: [
        {
          name: 'date',
        },
      ],
    });

    // Parse the response and create a markdown report
    let report = '# Google Analytics Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += '## Metrics (Last 7 Days)\n\n';
    report += '| Date | Active Users | Events | Page Views |\n';
    report += '|------|--------------|--------|-----------|\n';

    response[0].rows.forEach(row => {
      const date = row.dimensionValues[0].value;
      const activeUsers = row.metricValues[0].value;
      const events = row.metricValues[1].value;
      const pageViews = row.metricValues[2].value;
      report += `| ${date} | ${activeUsers} | ${events} | ${pageViews} |\n`;
    });

    // Write the report to a file
    fs.writeFileSync('analytics-report.md', report);
    console.log('Analytics report generated successfully!');

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    process.exit(1);
  }
}

fetchAnalyticsData();
