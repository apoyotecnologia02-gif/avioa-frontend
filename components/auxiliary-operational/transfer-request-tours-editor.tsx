'use client';
import {useState,type FormEvent} from 'react';
import {Save} from 'lucide-react';
import type {TransferRequestRecord} from '@/lib/auxiliary-operational/domain/transfer-requests';

export default function TransferRequestToursEditor({record,busy,onSave,onCancel}:{record:TransferRequestRecord;busy:boolean;onSave:(tours:string,tourNotes:string)=>Promise<void>;onCancel:()=>void}){
 const [tours,setTours]=useState(record.data.tours),[tourNotes,setTourNotes]=useState(record.data.tourNotes);
 async function submit(e:FormEvent){e.preventDefault();if(!busy)await onSave(tours,tours==='SI'?tourNotes:'');}
 return <form onSubmit={submit} className="tr-review" aria-label="Editar tours de la solicitud"><h3>Editar tours · {record.data.reservationCode}</h3><p>Actualiza los tours de esta solicitud y de su voucher guardado.</p>{record.state!=='pending'&&<p className="aux-notice">Esta solicitud ya fue gestionada. Comunica la corrección al operador y confirma los tours con él. Guardar aquí no envía mensajes ni registra una nueva confirmación.</p>}<fieldset disabled={busy} className="tr-fieldset"><div className="tr-fields"><label>¿Incluye tours?<select required value={tours} onChange={e=>setTours(e.target.value)}><option value="NO">No</option><option value="SI">Sí</option></select></label>{tours==='SI'&&<label className="tr-wide">Tours incluidos<textarea required maxLength={1200} rows={4} value={tourNotes} onChange={e=>setTourNotes(e.target.value)} placeholder="Ej.: Playa Blanca con almuerzo"/></label>}</div><div className="tr-actions"><button type="submit" className="aux-primary"><Save size={16}/>{busy?'Guardando…':'Guardar cambios y actualizar voucher'}</button><button type="button" onClick={onCancel}>Cancelar edición</button></div></fieldset></form>;
}
