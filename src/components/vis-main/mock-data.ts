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
  ],
  pluginIndexUrl: 'public/plugins/vis-main/index.json',
  plugins: [
    {
      name: 'Longbar',
      plugins: [
        {
          granularity: 'monthly',
          name: 'SidebarLineChart',
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
