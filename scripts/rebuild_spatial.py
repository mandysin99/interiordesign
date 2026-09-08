import json, math, shutil
from pathlib import Path
out=Path(__file__).resolve().parents[1]
S=64.0; OX=158; OZ=48; H=2.70
boxes=[]; openings=[]; doors=[]
def p(x,z): return [round((x-OX)/S,5),round((z-OZ)/S,5)]
def box(id,x1,z1,x2,z2,y0=0,y1=H,kind='wall',layer='architecture',note=''):
 a=p(x1,z1);b=p(x2,z2)
 boxes.append(dict(id=id,kind=kind,layer=layer,min=[a[0],y0,a[1]],max=[b[0],y1,b[1]],source_rect=[x1,z1,x2,z2],note=note))
def wall(id,axis,c,a,b,t=0.18,ops=[],height=H,kind='wall'):
 # All openings are true voids; the wall is decomposed into jambs, sill, and lintel solids.
 segments=[];cursor=a
 for op in sorted(ops,key=lambda o:o['center']):
  lo=op['center']-op['width']*S/2;hi=op['center']+op['width']*S/2
  assert lo>=a-0.01 and hi<=b+0.01,(id,lo,hi,a,b)
  if lo>cursor:segments.append((cursor,lo,0,height,'jamb'))
  if op['sill']>0:segments.append((lo,hi,0,op['sill'],'sill'))
  if op['head']<height:segments.append((lo,hi,op['head'],height,'lintel'))
  opening=dict(op,wall=id,axis=axis,plane=c,from_px=lo,to_px=hi,thickness=t)
  openings.append(opening)
  cursor=hi
 if cursor<b:segments.append((cursor,b,0,height,'jamb'))
 for i,(lo,hi,y0,y1,part) in enumerate(segments):
  if axis=='x':box(f'{id}-{part}-{i}',lo,c-t*S/2,hi,c+t*S/2,y0,y1,kind)
  else:box(f'{id}-{part}-{i}',c-t*S/2,lo,c+t*S/2,hi,y0,y1,kind)

def op(id,center,width,sill,head,kind='window',**kw):return dict(id=id,center=center,width=width,sill=sill,head=head,kind=kind,**kw)
# Balcony is enclosed in the site photos, with a low curb and a separate guardrail.
wall('W-balcony-left','z',164,48,172,.20)
wall('W-balcony-right','z',368,48,172,.18)
wall('W-balcony-front','x',54,164,368,.16,[op('WIN-balcony',266,3.045,.16,2.45,photo='165313 / 165315',evidence='照片；高度暂定')])
wall('W-balcony-living','x',173,164,358,.20,[op('D-balcony',272,2.090,0,2.353,'sliding',evidence='图纸门宽2090、门高2353',rooms=['living','balcony'])])
# Main enclosure and partitions traced from the supplied measured plan.
wall('W-living-west','z',164,173,417,.20)
wall('W-living-notch-north','x',417,164,187,.18)
wall('W-west-portal','z',187,417,507,.16) # Full plan confirms a continuous stepped wall, not a doorway.
wall('W-west-return','x',507,143,187,.18)
wall('W-west-niche','z',143,507,572,.18)
wall('W-west-return-south','x',572,143,188,.18)
wall('W-entry-west','z',188,572,687,.18)
wall('W-entry-south','x',687,188,268,.18,[op('D-entry',228,1.04,0,2.28,'door',evidence='入口位置参考手绘图；门高及开启暂定',rooms=['entry','outside'],hinge='start',swing=-1)])
# Historical W-kitchen-east ID is retained for the WEST kitchen glass boundary at the entry.
wall('W-kitchen-east','z',268,550,687,.14,[op('G-kitchen-east',617,2.05,0,2.28,'sliding',evidence='平面2050与现场L形玻璃隔断；高暂定',rooms=['entry','kitchen'])])
wall('W-kitchen-north','x',550,268,361,.14,[op('G-kitchen-north',314.5,1.340,0,2.28,'sliding',evidence='图纸1340；现场L形玻璃隔断',rooms=['living','kitchen'])])
wall('W-living-east-lower','z',361,435,550,.20)
wall('W-corridor-south','x',435,361,606,.16,[op('D-service',414,0.810,0,2.28,'door',evidence='宜家门宽810；完整图确认连接卫生间',rooms=['corridor','bathroom'],hinge='start',swing=1),op('WIN-corridor',572,0.710,.405,1.235,'interior-glazing',evidence='手绘W710/H405/H窗830；去向待核实')])

# BASE-v2 additions aligned to the retained IKEA corner. Kitchen clear width 1.910m.
# xEastInner = west glazing inner face 269.76px + 1.910m * 64px/m = 392px.
wall('W-kitchen-exterior-east','z',398.4,550,687,.20,[op('WIN-kitchen-east',621.7,.860,.90,2.15,'window',evidence='完整图窗宽860；厨房HEIC与视频核对；窗台/窗顶暂定')])
wall('W-kitchen-exterior-south','x',687,268,398.4,.18)
# Bathroom shared north wall and its 810mm entrance already exist in the base revision.
wall('W-bathroom-east','z',534.12,435,540.4,.24)
wall('W-bathroom-south','x',540.4,361,534.12,.30,[op('WIN-bathroom-south',444.8,.550,1.10,2.10,'window',evidence='完整图窗宽550；IMG_3416可见窗；窗台/窗顶暂定')])
# Glass separation into the shower bay, as shown in the full plan. Exact height is inferred.
wall('W-bathroom-shower-divider','z',477.8,440.12,530.8,.08,[op('G-shower-divider',488.0,1.10,0,2.10,'shower-sliding',evidence='完整图内部分隔；玻璃高及分格暂定',rooms=['bathroom','shower'])],height=2.10,kind='partition')

wall('W-bedroom1-west','z',358,173,359,.22)
wall('W-bedroom12','z',519,158,359,.22)
wall('W-bedroom23','z',676,158,365,.22)
wall('W-bedroom1-south','x',359,358,519,.16,[op('D-bedroom1',478,.920,0,2.28,'door',evidence='图纸920；手绘H2280',rooms=['corridor','bedroom1'],hinge='end',swing=1)])
wall('W-bedroom2-south','x',359,519,676,.16,[op('D-bedroom2',565.5,.920,0,2.28,'door',evidence='图纸920；高暂定',rooms=['corridor','bedroom2'],hinge='start',swing=-1)])
wall('W-master-neck-north','x',365,606,676,.16)
wall('W-master-door','z',606,365,435,.16,[op('D-master',398,.920,0,2.28,'door',evidence='图纸920；高暂定',rooms=['corridor','master'],hinge='end',swing=1)])
wall('W-master-east','z',839,201,435,.22)
# Four bay window assemblies. Sill height 425/435 and glazing heights follow the drawing.
bays=[
 dict(id='bay-bedroom1',x1=358,x2=519,roomz=201,outerz=158,width=2.09,outerwidth=1.49,outercenter=460.0,sill=.425,gh=1.820),
 dict(id='bay-bedroom2',x1=519,x2=676,roomz=201,outerz=158,width=2.195,outerwidth=2.195,outercenter=597.5,sill=.425,gh=1.826),
 dict(id='bay-master-top',x1=676,x2=839,roomz=201,outerz=158,width=1.94,outerwidth=1.94,outercenter=764,sill=.435,gh=1.816),
 dict(id='bay-master-bottom',x1=606,x2=839,roomz=435,outerz=473,width=2.24,outerwidth=2.24,outercenter=760,sill=.425,gh=1.824),
]
for b in bays:
 id=b['id'];cx=b['outercenter'] if 'master' in id else (b['x1']+b['x2'])/2
 a=cx-b['width']*S/2;d=cx+b['width']*S/2;zlo,zhi=sorted([b['roomz'],b['outerz']]);direction=1 if b['outerz']>b['roomz'] else -1
 # room-side window aperture opens onto a solid bay platform.
 wall('W-'+id+'-room','x',b['roomz'],b['x1'],b['x2'],.18,[op('BAY-'+id,cx,b['width'],b['sill'],b['sill']+b['gh'],'bay-aperture',evidence='窗台及窗高按图纸，进深由截图推算')])
 box(id+'-platform',a,zlo,d,zhi,0,b['sill'],'bay-sill')
 wall('W-'+id+'-outer','x',b['outerz'],a-4,d+4,.12,[op('WIN-'+id,b['outercenter'],b['outerwidth'],b['sill'],b['sill']+b['gh'],evidence='图纸窗宽/台上/台下')])
 wall('W-'+id+'-left','z',a-2,zlo,zhi,.08)
 wall('W-'+id+'-right','z',d+2,zlo,zhi,.08)
 # The master has a shorter projecting bay, not a full-width recess.
 b['footprint_px']=[[a-4,zlo],[d+4,zlo],[d+4,zhi],[a-4,zhi]]
# Complete floor and roof footprint now includes the kitchen and bathroom extensions.
footprint=[[158,48],[374,48],[374,195],[845,195],[845,441],[541.8,441],[541.8,550],[404.8,550],[404.8,693],[182,693],[182,579],[137,579],[137,501],[181,501],[181,423],[158,423]]
rooms=[
 dict(id='living',name='客餐厅',area_label=23.22,center=p(276,331),camera=p(285,507),target=p(273,191),note='23.22㎡为原图标注，包含入户及走廊；非模型面积复算。'),
 dict(id='balcony',name='阳台',area_label=5.22,center=p(266,107),camera=p(276,142),target=p(266,58),note='照片可见上部封窗、下部玻璃栏板；不按露台处理。'),
 dict(id='bedroom1',name='1号 · 大次卧',area_label=5.44,center=p(438,278),camera=p(487,331),target=p(430,197),note='保留北侧飘窗；图纸顶部2090为窗洞相关尺寸，房间面积5.44㎡按原图。'),
 dict(id='bedroom2',name='2号 · 小次卧',area_label=5.19,center=p(597,278),camera=p(555,332),target=p(608,198),note='保留北侧飘窗，图示净深2366、窗宽2195。'),
 dict(id='master',name='3号 · 主卧',area_label=10.14,center=p(757,316),camera=p(722,402),target=p(780,202),note='L形入口与两处飘窗，北窗1940、南窗2240。'),
 dict(id='entry',name='入户',area_label=None,center=p(227,614),camera=p(226,653),target=p(277,425),note='右侧为已补齐的厨房，通过原有L形玻璃移门连接。'),
 dict(id='corridor',name='走廊',area_label=None,center=p(487,399),camera=p(382,396),target=p(615,396),note='连接三间卧室；南侧810门连接卫生间，另有一处沿用宜家的低位开口待核对。')]
rooms.extend([
 dict(id='kitchen',name='厨房',area_label=None,center=p(329,616),camera=p(322,653),target=p(394,610),note='本次新增：入户右侧、L形玻璃移门内。净宽约1.91m、进深约2.02m；东窗宽860mm。柜体未加入白模。',clear_dimensions=[1.91,2.023]),
 dict(id='bathroom',name='卫生间',area_label=None,center=p(425,491),camera=p(400,456),target=p(445,530),note='本次新增：走廊南侧810门进入；南侧550mm外窗，东侧保留图示玻璃分隔。净尺寸约2.49×1.42m，待实测核对。',clear_dimensions=[2.485,1.417])
])
# Window frames / glass are separate from masonry and contain no decorative finishes.
for o in openings:
 if o['kind'] in ['portal','bay-aperture']:continue
 axis=o['axis'];c=o['plane'];a=o['from_px'];b=o['to_px'];h0=o['sill'];h1=o['head'];fid=o['id'];bar=.04;th=.055
 def component(suffix,lo,hi,y0,y1,kind='frame'):
  if axis=='x':box(fid+'-'+suffix,lo,c-th*S/2,hi,c+th*S/2,y0,y1,kind,'openings')
  else:box(fid+'-'+suffix,c-th*S/2,lo,c+th*S/2,hi,y0,y1,kind,'openings')
 component('frame-a',a,a+bar*S,h0,h1);component('frame-b',b-bar*S,b,h0,h1)
 component('frame-head',a,b,h1-bar,h1)
 if o['kind']=='door':
  doors.append(dict(id=fid,axis=axis,hinge=p(a if o.get('hinge')=='start' else b,c) if axis=='x' else p(c,a if o.get('hinge')=='start' else b),width=o['width']-2*bar,height=h1-.035,hinge_end=o.get('hinge','start'),swing=o.get('swing',1),rooms=o.get('rooms',[])))
 else:
  component('frame-sill',a,b,h0,h0+bar)
  mid=(a+b)/2;component('mullion',mid-bar*S/2,mid+bar*S/2,h0,h1)
  component('glass-a',a+bar*S,mid-bar*S/2,h0+bar,h1-bar,'glass')
  component('glass-b',mid+bar*S/2,b-bar*S,h0+bar,h1-bar,'glass')
  if o['id']=='WIN-balcony':component('guardrail',a,b,1.065,1.115)
assumptions=['本版为 BASE-v2 建筑白模，补齐厨房与卫生间；未加入家具、柜体、洁具或饰面设计。BASE-v1已归档。', '厨房与卫生间边界来自9047fa242c8adec8df3fd41b9b85931e.jpg，并与原宜家L形玻璃角及走廊门对齐。其他已建房间的几何沿用v1。', '完整图与宜家实测图的局部尺寸和门开启表达存在差异。本次以完整图补足缺失范围、以宜家图保留已有实测开口；未将两个截图视为完全等比例的测量底图。', '厨房净宽约1.910m、进深约2.023m，参考完整图1910/2020标注；东侧外窗宽0.860m。窗台0.90m、窗顶2.15m暂定。', '卫生间净宽约2.485m、进深约1.417m，由完整图局部比例估算并对齐既有墙线。南侧窗宽0.550m；窗台1.10m、窗顶2.10m暂定。东侧图示玻璃分隔按2.10m高表达，具体开启方式待确认。', '厨房HEIC和17.13秒视频的12个均匀关键帧确认L形玻璃入口、尽端外窗和两侧既有柜体；厨房柜体没有纳入纯建筑白模。卫生间IMG_3416用于核对有外窗，洁具未据单张照片推定完整布局。', '完整图确认入户左侧是连续的凹凸墙体；已取消v1把1220壁段误当门洞的开口。', '统一墙顶仍暂定2.70m；装饰吊顶、厨卫吊顶净高、高差和降板没有完整尺寸。楼板/顶板厚0.12m为建模暂定。', '厨房门高沿用v1暂定2.28m，L形滑门的收拢方式为简化展示；三间卧室及阳台开口尺寸沿用宜家图。', '完整图标有北箭头，图上为北；展示光照仍不构成真实日照模拟。', '新增结构已按截图拼接到既有模型。尚需核对墙厚、柱垛、窗台与窗顶标高、厨卫净尺寸和卫生间玻璃分隔；承重属性未知。', '走廊南侧原宜家图的低位开口继续保留，和新图的空心线框表达对应关系仍需现场确认。']
data=dict(schema='residential-spatial-design/1.0',version='BASE-v2',stage='white-model-review',units='metres',coordinate_system='X right on source drawing; Y up; Z down on source drawing',source=dict(plan='assets/source-plan.png',reference='assets/source-3d.png',full_plan='assets/full-plan.jpg',full_plan_alignment=dict(scale=64/71.45,anchor_full=[416,574],anchor_model_px=[361,435]),pixel_origin=[OX,OZ],pixels_per_metre=S,orientation='north-up (full plan arrow)',site_photos='/Users/beverley/Desktop/new home/宜家/现场照片'),wall_height=H,boxes=boxes,openings=openings,doors=doors,footprint=[p(*v) for v in footprint],footprint_px=footprint,bays=bays,rooms=rooms,assumptions=assumptions,design_layers=[],confirmed=False)
(out/'spatial.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(out/'src/spatial-data.js').write_text('export const spatial = '+json.dumps(data,ensure_ascii=False)+';\n')
for src,name in [('微信图片_2026-09-01_165339_713.jpg','site-measurements.jpg'),('微信图片_2026-09-01_165313_309.jpg','site-balcony.jpg'),('微信图片_2026-09-01_165316_985.jpg','site-kitchen.jpg')]:
 source=Path('/Users/beverley/Desktop/new home/宜家/现场照片')/src
 if source.exists(): shutil.copy(source,out/'assets'/name)
print(f'Created {len(boxes)} solid parts, {len(openings)} openings, {len(doors)} hinged doors; no design layer.')
