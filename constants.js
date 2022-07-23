export const	NOP = 0            // 0x00 // NOP                                   - 
export const	JMP = 1            // 0x01 // JMP           addr                    cmdAddr = addr
export const	CTOMI1 = 2         // 0x02 // CTOMI1        value                   mi1 = value
export const	CTOMI2 = 3         // 0x03 // CTOMI2        value                   mi2 = value
export const	MOSUMTOMI1 = 4     // 0x04 // MOSUMTOMI1                            mi1 = mi1 + mi2
export const	MOSUBTOMI1 = 5     // 0x05 // MOSUBTOMI1                            mi1 = mi1 - mi2
export const	CTOMEM = 6         // 0x06 // CTOMEM        addr       value        mem [addr] = value       addr is const in progmem, value is const number
export const	MEMTOMI1 = 7       // 0x07 // MEMTOMI1      addr                    mi1 = mem [addr]         addr is const in progmem
export const	MI1TOMEM = 8       // 0x08 // MI1TOMEM      addr                    mem [addr] = mi1         addr is const in progmem
export const	MEMTOMI2 = 9       // 0x09 // MEMTOMI2      addr                    mi2 = mem [addr]         addr is const in progmem
export const	MI2TOMEM = 10      // 0x0A // MI2TOMEM      addr                    mem [addr] = mi2         addr is const in progmem
export const	CTORA = 11         // 0x0B // CTROA         value                   ra = value
export const	INCRA = 12         // 0x0C // INCRA                                 ra = ra + 1
export const	DECRA = 13         // 0x0D // DECRA                                 ra = ra - 1
export const	MEMRATOMI2 = 14    // 0x0E // MEMRATOMI2                            mi2 = mem[ra]
export const	MI2TOMEMRA = 15    // 0x0F // MI2TOMEMRA                            mem[ra] = mi2
export const	MI2TORA = 16       // 0x10 // MI2TORA                               ra = mi2
export const	RATOMI2 = 17       // 0x11 // RATOMI2                               mi2 = ra
export const	SWPMI = 18         // 0x12 // SWMPI
export const	MI1TORA = 19       // 0x13 // MI1TORA
export const	MI1TOMEMRA = 20    // 0x14 // MI1TOMEMRA
export const 	PUSHMI1 = 21	   // 0x15 // PUSHMI1          addr                 stack[addr].push(mi1)
export const 	PUSHMI2 = 22	   // 0x16 // PUSHMI2          addr                 stack[addr].push(mi2)
export const 	POPMI1 = 23	       // 0x17 // POPMI1           addr                 mi1 = stack[addr].pop()
export const 	POPMI2 = 24	       // 0x18 // POPMI2           addr                 mi2 = stack[addr].pop()                 
export const    PUSHMI1MI2 = 25    // 0x19 // PUSHMI1MI2                            stack[mi2].push(mi1)
export const    POPMI1MI2 = 26     // 0x19 // PUSHMI1MI2                            mi1 = stack[mi2].pop()



	export const	commands = {
		NOP, JMP, CTOMI1, CTOMI2, MOSUMTOMI1, MOSUBTOMI1, CTOMEM, MEMTOMI1, MI1TOMEM, MEMTOMI2, MI2TOMEM, CTORA, INCRA, DECRA, MEMRATOMI2, MI2TOMEMRA, MI2TORA, RATOMI2, SWPMI, MI1TORA, MI1TOMEMRA, PUSHMI1, PUSHMI2, POPMI1, POPMI2, PUSHMI1MI2, POPMI1MI2
	}

	export const	commandArgs = {
		NOP:0, JMP:1, CTOMI1:1, CTOMI2:1, MOSUMTOMI1:0, MOSUBTOMI1:0, CTOMEM:2, MEMTOMI1:1, MI1TOMEM:1, MEMTOMI2:1, MI2TOMEM:1, CTORA:1, INCRA:0, DECRA:0, MEMRATOMI2:0, MI2TOMEMRA:0, 
		MI2TORA:0, RATOMI2:0, SWPMI:0, MI1TORA:0, MI1TOMEMRA:0, PUSHMI1:1, PUSHMI2:1, POPMI1:1, POPMI2:1, PUSHMI1MI2:0, POPMI1MI2:0
	}