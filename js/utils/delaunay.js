var Delaunay;!function(){"use strict";var EPSILON=1/1048576;function supertriangle(vertices){var xmin=Number.POSITIVE_INFINITY,ymin=Number.POSITIVE_INFINITY,xmax=Number.NEGATIVE_INFINITY,ymax=Number.NEGATIVE_INFINITY,i,dx,dy,dmax,xmid,ymid;for(i=vertices.length;i--;)vertices[i][0]<xmin&&(xmin=vertices[i][0]),vertices[i][0]>xmax&&(xmax=vertices[i][0]),vertices[i][1]<ymin&&(ymin=vertices[i][1]),vertices[i][1]>ymax&&(ymax=vertices[i][1]);return dy=ymax-ymin,[[(xmid=xmin+.5*(dx=xmax-xmin))-20*(dmax=Math.max(dx,dy)),(ymid=ymin+.5*dy)-dmax],[xmid,ymid+20*dmax],[xmid+20*dmax,ymid-dmax]]}function circumcircle(vertices,i,j,k){var x1=vertices[i][0],y1=vertices[i][1],x2=vertices[j][0],y2=vertices[j][1],x3=vertices[k][0],y3=vertices[k][1],fabsy1y2=Math.abs(y1-y2),fabsy2y3=Math.abs(y2-y3),xc,yc,m1,m2,mx1,mx2,my1,my2,dx,dy;if(fabsy1y2<EPSILON&&fabsy2y3<EPSILON)throw new Error("Eek! Coincident points!");return fabsy1y2<EPSILON?yc=(m2=-(x3-x2)/(y3-y2))*((xc=(x2+x1)/2)-(mx2=(x2+x3)/2))+(my2=(y2+y3)/2):fabsy2y3<EPSILON?yc=(m1=-(x2-x1)/(y2-y1))*((xc=(x3+x2)/2)-(mx1=(x1+x2)/2))+(my1=(y1+y2)/2):(xc=((m1=-(x2-x1)/(y2-y1))*(mx1=(x1+x2)/2)-(m2=-(x3-x2)/(y3-y2))*(mx2=(x2+x3)/2)+(my2=(y2+y3)/2)-(my1=(y1+y2)/2))/(m1-m2),yc=fabsy1y2>fabsy2y3?m1*(xc-mx1)+my1:m2*(xc-mx2)+my2),{i:i,j:j,k:k,x:xc,y:yc,r:(dx=x2-xc)*dx+(dy=y2-yc)*dy}}function dedup(edges){var i,j,a,b,m,n;for(j=edges.length;j;)for(b=edges[--j],a=edges[--j],i=j;i;)if(n=edges[--i],a===(m=edges[--i])&&b===n||a===n&&b===m){edges.splice(j,2),edges.splice(i,2);break}}Delaunay={triangulate:function(vertices,key){var n=vertices.length,i,j,indices,st,open,closed,edges,dx,dy,a,b,c;if(n<3)return[];if(vertices=vertices.slice(0),key)for(i=n;i--;)vertices[i]=vertices[i][key];for(indices=new Array(n),i=n;i--;)indices[i]=i;for(indices.sort((function(i,j){return vertices[j][0]-vertices[i][0]})),st=supertriangle(vertices),vertices.push(st[0],st[1],st[2]),open=[circumcircle(vertices,n+0,n+1,n+2)],closed=[],edges=[],i=indices.length;i--;edges.length=0){for(c=indices[i],j=open.length;j--;)(dx=vertices[c][0]-open[j].x)>0&&dx*dx>open[j].r?(closed.push(open[j]),open.splice(j,1)):dx*dx+(dy=vertices[c][1]-open[j].y)*dy-open[j].r>EPSILON||(edges.push(open[j].i,open[j].j,open[j].j,open[j].k,open[j].k,open[j].i),open.splice(j,1));for(dedup(edges),j=edges.length;j;)b=edges[--j],a=edges[--j],open.push(circumcircle(vertices,a,b,c))}for(i=open.length;i--;)closed.push(open[i]);for(open.length=0,i=closed.length;i--;)closed[i].i<n&&closed[i].j<n&&closed[i].k<n&&open.push(closed[i].i,closed[i].j,closed[i].k);return open},contains:function(tri,p){if(p[0]<tri[0][0]&&p[0]<tri[1][0]&&p[0]<tri[2][0]||p[0]>tri[0][0]&&p[0]>tri[1][0]&&p[0]>tri[2][0]||p[1]<tri[0][1]&&p[1]<tri[1][1]&&p[1]<tri[2][1]||p[1]>tri[0][1]&&p[1]>tri[1][1]&&p[1]>tri[2][1])return null;var a=tri[1][0]-tri[0][0],b=tri[2][0]-tri[0][0],c=tri[1][1]-tri[0][1],d=tri[2][1]-tri[0][1],i=a*d-b*c;if(0===i)return null;var u=(d*(p[0]-tri[0][0])-b*(p[1]-tri[0][1]))/i,v=(a*(p[1]-tri[0][1])-c*(p[0]-tri[0][0]))/i;return u<0||v<0||u+v>1?null:[u,v]}},"undefined"!=typeof module&&(module.exports=Delaunay)}();