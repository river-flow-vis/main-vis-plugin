import { MainData } from '../../utils/data';

export const mockData: MainData = {
  baseLayers: ['Grayscale', 'Streets'],
  overlayLayers: [
    {
      colorMap: [
        [-1000, 50, '#d8f3dc', '< 50'],
        [50, 100, '#95d5b2'],
        [100, 150, '#52b788'],
        [150, 1000, '#2d6a4f', '> 150'],
      ],
      dataIndexUrl: 'public/data/catchment/index.json',
      name: 'Scalar SWE',
      variable: 'scalarSWE',
    },
    {
      colorMap: [
        [-1000, -150, '#addd8e', '< -150'],
        [-150, -100, '#93D284'],
        [-100, -50, '#78c679'],
        [-50, 0, '#41ab5d'],
        [0, 1000, '#006837', '> 0'],
      ],
      dataIndexUrl: 'public/data/catchment/index.json',
      name: 'Scalar Sen Heat Total',
      variable: 'scalarSenHeatTotal',
    },
    {
      type: 'matrix',
      name: 'Contour',
      plot: 'contour',
      dataIndexUrl: 'public/data/matrix/index.json',
      thresholds: [245, 250, 255, 260, 265, 270, 275],
      colors: {
        245: 'hsl(180, 50%, 50%, 0)',
        250: 'hsl(180, 50%, 50%, .167)',
        255: 'hsl(180, 50%, 50%, .333)',
        260: 'hsl(180, 50%, 50%, .5)',
        265: 'hsl(180, 50%, 50%, .666)',
        270: 'hsl(180, 50%, 50%, .833)',
        275: 'hsl(180, 50%, 50%, 1)',
      },
    },
    {
      type: 'matrix',
      name: 'Scatter',
      plot: 'scatter',
      dataIndexUrl: 'public/data/matrix/index.json',
      colorRange: ['hsla(180, 50%, 50%, 0', 'hsla(180, 50%, 50%, 1'],
    },
  ],
  pluginIndexUrl: 'public/plugins/vis-main/index.json',
  plugins: [
    {
      name: 'Longbar',
      plugins: [
        {
          granularity: 'monthly',
          name: 'LongbarLineChart',
          title: 'Line',
          variables: ['scalarSWE', 'scalarSenHeatTotal'],
        },
      ],
    },
    {
      name: 'Sidebar',
      plugins: [
        {
          name: 'SidebarMetadata',
        },
        {
          granularity: 'monthly',
          name: 'SidebarBarChart',
          title: 'Bar',
        },
        {
          granularity: 'monthly',
          name: 'SidebarLineChart',
          title: 'Line',
          variables: ['scalarSWE', 'scalarSenHeatTotal'],
        },
      ],
      width: '30rem',
    },
    {
      name: 'Legend',
      variable: 'scalarSWE',
      width: '20rem',
    },
    {
      name: 'Legend',
      variable: 'scalarSenHeatTotal',
      width: '20rem',
    },
    {
      name: 'TimeControl',
      width: '20rem',
    },
  ],
  yearRange: [2010, 2012],
};
