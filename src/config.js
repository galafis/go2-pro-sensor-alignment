export default {
  slug: 'go2-pro-sensor-alignment',
  title: 'Go2 PRO Sensor Alignment',
  color: '#2367a1',
  group: 'Unitree Go2 PRO',
  tagline: {
    en: 'Align paired planar observations and inspect held-out residuals.',
    pt: 'Alinhe observações planas pareadas e inspecione resíduos fora do ajuste.',
  },
  description:
    'EN: Align paired planar observations and inspect held-out residuals. PT: Alinhe observações planas pareadas e inspecione resíduos fora do ajuste.',
  topics: [
    'unitree-go2',
    'robotics',
    'research-prototype',
    'bilingual',
    'javascript',
    'coordinate-transforms',
    'calibration',
    'metrology',
  ],
  setting: {
    key: 'maxResidualM',
    label: {
      en: 'Residual review threshold (m)',
      pt: 'Limiar de revisão do resíduo (m)',
    },
    min: 0.001,
    max: 100,
    step: 0.001,
  },
  default: 0.1,
};
