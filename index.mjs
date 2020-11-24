import { runLighthouse } from 'lighthouse-benchmark'
import Markdown from 'markdown-it';

import fsPkg from 'fs-extra';
const { writeFile, emptyDir } = fsPkg;


import plotPkg from 'plot';
const { plot } = plotPkg;

import "@plotex/render-image";


import createConfig from './config/suits.mjs'

const converter = new Markdown();

const config = createConfig(5);

const PERF_METRICS = [
  {
    id: 'time-to-first-byte',
    label: 'Time To first Byte'
  },
  {
    id: 'first-contentful-paint',
    label: 'First Contentful paint'
  },
  {
    id: 'first-meaningful-paint',
    label: 'First Meaningful Paint'
  },
  {
    id: 'speed-index',
    label: 'Speed Index'
  },
  {
    id: 'interactive',
    label: 'Time To Interactive'
  },
  {
    id: 'first-cpu-idle',
    label: 'First Cpu Idle'
  },
  {
    id: 'estimated-input-latency',
    label: 'Estimated Input Latency'
  },
  {
    id: 'max-potential-fid',
    label: 'Max Potential FID'
  },
  {
    id: 'main-thread-tasks',
    label: 'Main Thread Tasks'
  },
];

(async function () {
  const data = await runLighthouse([config]);

  await emptyDir('output');

  await writeFile('output/data.json', JSON.stringify(data));

  for (const metric of PERF_METRICS) {
    await emptyDir(`output/${metric.id}`);

    const plotData = data.map(site => {
      return {
        y: site.analyzed[`http://localhost:3000/${site.label}`][metric.id]['avg'].toFixed(2),
        x: site.label
      }
    })
  
    const chartConfig = {
      chartType: "bar",
      x: {
        label: 'Website'
      },
      y: {
        label: metric.label,
        min: 0
      }
    };

    plot(plotData, chartConfig).renderImage(`output/${metric.id}/chart.png`);


    let txtData = '|Strona|Pomiar #1|Pomiar #2|Pomiar #3|Pomiar #4|Pomiar #5|Średnia|Odch. Std.|\n';
    txtData += '|-|-|-|-|-|-|-|-|\n';
    
    data.forEach(suite => {
      txtData += '|';
      txtData += suite.label + '|';
      suite.totals.forEach(run => {
        txtData += run[metric.id].toFixed(2) + '|';
      })

      txtData += suite.analyzed[`http://localhost:3000/${suite.label}`][metric.id]['avg'].toFixed(2) + '|';
      txtData += suite.analyzed[`http://localhost:3000/${suite.label}`][metric.id]['stdDev'].toFixed(2) + '|';
      txtData += '\n';
    })

    await writeFile(`output/${metric.id}/table.md`, txtData);

    const html  = converter.render(txtData);

    await writeFile(`output/${metric.id}/table.html`, html);

  }

})()