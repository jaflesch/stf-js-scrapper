enum MapProvinceToGeChartCode {
  "AC - ACRE" = 'BR-AC',
  "PA - PARÁ" = 'BR-PA',
  "AP - AMAPÁ"  = 'BR-AP',
  "BA - BAHIA"  = 'BR-BA',
  "CE - CEARÁ"  = 'BR-CE',
  "GO - GOIÁS"  = 'BR-GO',
  "PR - PARANÁ" = 'BR-PR',
  "PI - PIAUÍ"  = 'BR-PI',
  "AM - AMAZONAS" = 'BR-AM',
  "AL - ALAGOAS"  = 'BR-AL',
  "PB - PARAÍBA"  = 'BR-PB',
  "MA - MARANHÃO" = 'BR-MA',
  "RO - RONDÔNIA" = 'BR-RO',
  "RR - RORAIMA"  = 'BR-RR',
  "SE - SERGIPE"  = 'BR-SE',
  "SP - SÃO PAULO"  = 'BR-SP',
  "PE - PERNAMBUCO" = 'BR-PE',
  "TO - TOCANTINS"  = 'BR-TO',
  "MG - MINAS GERAIS" = 'BR-MG',
  "MT - MATO GROSSO"  = 'BR-MT',
  "ES - ESPÍRITO SANTO" = 'BR-ES',
  "SC - SANTA CATARINA" = 'BR-SC',
  "RJ - RIO DE JANEIRO" = 'BR-RJ',
  "DF - DISTRITO FEDERAL" = 'BR-DF',
  "RS - RIO GRANDE DO SUL"  = 'BR-RS',
  "MS - MATO GROSSO DO SUL" = 'BR-MS',
  "RN - RIO GRANDE DO NORTE"  = 'BR-RN',
}

export const getGeoChartBRCode = (brProvince: keyof typeof MapProvinceToGeChartCode) => {
  return MapProvinceToGeChartCode[brProvince] || '';

}
