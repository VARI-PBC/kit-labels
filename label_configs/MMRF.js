module.exports = [
  {
    'kitTypes': ['MMRF Kit'],
    'componentTypes': ['MMRF NaHep 6ml Tube'],
    'labels': [
      {
        'description': 'BM tubes',
        'templateFile': 'MMRF Kit Tube.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%-BM%sequence%',
        'sequenceSpec': '1-4'
      },
      {
        'name': 'btDescription',
        'value': 'Bone Marrow only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Kit'],
    'componentTypes': ['MMRF EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'PB tubes',
        'templateFile': 'MMRF Kit Tube.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%-PB%sequence%',
        'sequenceSpec': '1-6'
      },
      {
        'name': 'btDescription',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Bulk Tube - MMRF'],
    'componentTypes': ['MMRF NaHep 6ml Tube'],
    'labels': [
      {
        'description': 'BM tubes',
        'templateFile': 'MMRF Tube - Bulk Kit.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescription',
        'value': 'Bone Marrow only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Bulk Tube - MMRF'],
    'componentTypes': ['MMRF EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'PB tubes',
        'templateFile': 'MMRF Tube - Bulk Kit.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescription',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Bulk Tube - Cellsave', 'MMRF Janssen Kit'],
    'componentTypes': ['MMRF CellSave Tube'],
    'labels': [
      {
        'description': 'CellSave tubes',
        'templateFile': 'MMRF Janssen Tube.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescription',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Spain Kit'],
    'componentTypes': ['MMRF NaHep 6ml Tube'],
    'labels': [
      {
        'description': 'BM tubes',
        'templateFile': 'MMRF Spain Kit.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescription',
        'value': ''
      }
    ]
  },
  {
    'kitTypes': ['MMRF Spain Kit'],
    'componentTypes': ['MMRF EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'PB tubes',
        'templateFile': 'MMRF Spain Kit.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btDescription',
        'value': 'Peripheral Blood only'
      }
    ]
  },
  {
    'kitTypes': ['MMRF Spain Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'MMRF Spain Kit Expirations.btw',
        'printer': 'BW2BW09'
      }
    ],
    'labelVariables': [
      {
        'name': 'btEdtaExpDate',
        'value': (kitFields, components) => 'EDTA: ' + components['MMRF EDTA 6ml Tube'].expiration.substr(0, 7)
      },
      {
        'name': 'btNaHepExpDate',
        'value': (kitFields, components) => 'Sodium Heparin: ' + components['MMRF NaHep 6ml Tube'].expiration.substr(0, 7)
      }
    ]
  }
]
