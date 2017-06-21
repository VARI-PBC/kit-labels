module.exports = [
  {
    'kitTypes': ['MMRF Kit'],
    'labels': [
      {
        'description': 'kit label',
        'templateFile': 'MMRF Kit ID Label.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%',
        'sequenceSpec': '1-3'
      }
    ]
  },
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
        'name': 'btDescriptor',
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
        'name': 'btDescriptor',
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
        'name': 'btDescriptor',
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
        'name': 'btDescriptor',
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
        'name': 'btDescriptor',
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
        'name': 'btDescriptor',
        'value': 'Bone Marrow only'
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
        'name': 'btDescriptor',
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
        'name': 'btMedia1',
        'value': 'EDTA'
      },
      {
        'name': 'btExpDate1',
        'value': (kitFields, components) => components['MMRF EDTA 6ml Tube'].expiration.substr(0, 7)
      },
      {
        'name': 'btMedia2',
        'value': 'Sodium Heparin'
      },
      {
        'name': 'btExpDate2',
        'value': (kitFields, components) => components['MMRF NaHep 6ml Tube'].expiration.substr(0, 7)
      }
    ]
  }
]
