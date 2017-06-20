module.exports = [
  {
    'kitTypes': ['TSC* Kit'],
    'labels': [
      {
        'description': 'kit label',
        'templateFile': 'Kit ID Label.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btKitID',
        'value': '%kitLabel%'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%-%sequence%',
        'sequenceSpec': '1-2'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'TSC EDTA Tube Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btEdtaExpDate',
        'value': (kitFields, components) => 'EDTA Tubes: ' + components['TSC-EDTA 6ml Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC RDCRN Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'Label #',
        'value': '%sequence%',
        'sequenceSpec': '1-6'
      }
    ]
  },
  {
    'kitTypes': ['TSC RDCRN Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'TSC Kit Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btEdtaExpDate',
        'value': (kitFields, components) => 'PAXgene RNA Tubes: ' + components['TSC-PAXgene RNA Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'componentTypes': ['TSC-EDTA 6ml Tube'],
    'labels': [
      {
        'description': 'EDTA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'Label #',
        'value': '%sequence%',
        'sequenceSpec': '1-3'
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'componentTypes': ['TSC-PAXgene RNA Tube'],
    'labels': [
      {
        'description': 'PAXgene RNA tube',
        'templateFile': 'TSC Blood Tubes.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'Label #',
        'value': '%sequence%',
        'sequenceSpec': '1-2'
      }
    ]
  },
  {
    'kitTypes': ['TSC PReVENT Blood Kit'],
    'labels': [
      {
        'description': 'media expiration',
        'templateFile': 'TSC RNA Tube Expiration.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btEdtaExpDate',
        'value': (kitFields, components) => 'PAXgene RNA Tubes: ' + components['TSC-PAXgene RNA Tube'].expiration.substr(0, 7)
      },
      {
        'name': 'btNaHepExpDate',
        'value': (kitFields, components) => 'EDTA Tubes: ' + components['TSC-EDTA 6ml Tube'].expiration.substr(0, 7)
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Buccal Kit'],
    'labels': [
      {
        'description': 'buccal',
        'templateFile': 'TSC Buccal.btw',
        'printer': 'BW2BW08'
      }
    ],
    'labelVariables': [
      {
        'name': 'btKitID',
        'value': '%kitLabel%'
      }
    ]
  },
  {
    'kitTypes': ['TSC NHD Tissue Kit'],
    'componentTypes': ['TSC-CryoELITE Vial'],
    'labels': [
      {
        'description': 'CryoELITE',
        'templateFile': 'TSC Cryovial.btw',
        'printer': 'BW2BW10'
      },
      {
        'description': 'paperwork',
        'templateFile': 'TSC Paperwork.btw',
        'printer': 'BW2BW10'
      }
    ],
    'labelVariables': [
      {
        'name': 'btID',
        'value': '%kitLabel%-%sequence%',
        'sequenceSpec': '1-4'
      },
      {
        'name': 'btDescription',
        'value': 'Tissue'
      }
    ]
  }
]
