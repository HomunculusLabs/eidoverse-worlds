import json
d = json.load(open('/tmp/sweep327-census-b.json'))
E = {e['id']: e for e in d['entities']}
comps = [i for i, e in E.items() if e.get('comp')]
lights = [i for i, e in E.items() if e.get('kind') == 'light']
things = [i for i, e in E.items() if e.get('kind') != 'light']
print('entities:', d['count'], '| thing:', len(things), '| light:', len(lights), '| comp-bearing:', len(comps))
car = E['nx-carousel']
print('carousel lib:', car['lib'], '| compKeys:', sorted((car.get('comp') or {}).keys()))
co = E['nx-struct-co']
print('co:', co['pos'], round(co['yaw'], 6), co['lib'], co.get('comp'))
