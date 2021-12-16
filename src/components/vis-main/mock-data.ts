import { MainData } from '../../utils/data';

export const mockData: MainData = {
  baseLayers: ['Grayscale', 'Streets'],
  overlayLayers: [
    {
      colorMap: [
        [-1000, 20, '#addd8e', '< 20'],
        [20, 40, '#93D284'],
        [40, 60, '#78c679'],
        [60, 80, '#41ab5d'],
        [80, 1000, '#006837', '> 80'],
      ],
      dataIndexUrl: 'public/data/catchment/index.json',
      name: 'Scalar SWE',
      variable: 'scalarSWE',
    },
  ],
  pluginIndexUrl: 'public/plugins/vis-main/index.json',
  plugins: [
    {
      name: 'Sidebar',
      plugins: [
        {
          name: 'SidebarMetadata',
        },
        {
          granularity: 'monthly',
          name: 'SidebarBarChart',
        },
      ],
      width: '30rem',
    },
  ],
  yearRange: [2010, 2012],
};
