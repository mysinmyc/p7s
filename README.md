# P7S
Clock - Palestra 7 simul

Questa paginetta web è stata creata per allenarsi nella fase di memorizzazione per la risoluzione del clock con il metodo 7simul

In ogni caso il gioco &egrave pienamente funzionante.

## Metodo 7simul BPAUL flip 

Risolve il clock in 7 mosse (o meno se ci sono delle skip) + il flip

E' meno efficiente della versione noflip per la necessità di girare il clock a meta solve e ha una cifra in più da memorizzare. Tuttavia i calcoli sono molto più semplici

La rotazione del cock va eseguita in x2 (la faccia nera avrà il mezzogiorno è in basso, mentre la bianca in alto)

### Notazione

**facce**
A=faccia bianca
B=faccia nera (mezzogiorno in basso)

**orologi**
.U = alto 
.D = basso
.C = centrale
.R = destra
.L = sinistra
.UL = alto/sinistra
.UR = alto/destra
.DL = basso/sinistra
.DR = basso/destra

**pin**

0=abbasato
1=alzato

(alto/sinistra, alto/destra,basso/sinistra, basso/destra)

**mosse**

GL=mossa rotella sinistra
GR=mossa rotella destra

### memorizzazione

si parte dalla faccia bianca

M1 =  (A.D - A.R) (x2) + (B.UL - B.L)
M2 = B.C - B.U 
M3 = B.U - B.L

M4 = (B.D - B.R) + (x2) + (A.UL - A.L)
M5 = A.C - A.U
M6 = A.U - A.L

### Soluzione

(1,0,1,1)  
GL-->M1  
GR-->M2

(1,0,1,0)
GL-->allineare A.D-->A.R
GR-->M3

(1,0,0,0)
GL-->allineare A.C-->A.D
GR-->allineare A.DR-->A.R

CHECK --> i 4 orologi in basso a destra devono corrispondere

x2

CHECK --> i quattro orologi in alto a sinistra devono corrispondere

(1,0,1,1)  
GL-->M4  
GR-->M5

(1,0,1,0)
GL-->allineare B.D-->B.R
GR-->M6

(1,0,0,0)
GL-->allineare B.C-->B.D
GR-->allineare B.DR-->B.R

(1,0,0,1)
GL-->portate B.UL a mezzogiorno (in basso)
GR-->portate B.UR a mezzogiorno (in basso)

CHECK --> tutte le lancette delle due facce devono essere allineate a mezzogiorno

