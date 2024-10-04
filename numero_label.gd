extends Label  # Estende a classe Label

# Valor atual do número
var valor_atual: int = -5000
# Valor máximo
var valor_maximo: int = 2099
# Tempo total da animação em segundos
var duracao_animacao: float = 2.5

func _ready() -> void:
	# Inicia a animação após um atraso de 9 segundos
	visible = false
	await get_tree().create_timer(6.3).timeout
	visible = true
	set_process(true)

func _process(delta: float) -> void:
	# Incrementa o número a cada frame
	if valor_atual < valor_maximo:
		# Calcule quantos incrementos por segundo, baseado na duração total
		var incrementos_por_segundo: float = valor_maximo / duracao_animacao
		# Incrementa o valor atual
		valor_atual += incrementos_por_segundo * delta
		
		# Garante que o valor atual não ultrapasse o valor máximo
		valor_atual = min(valor_atual, valor_maximo)
		
		# Atualiza o texto do Label
		text = str(int(valor_atual))  # Converte o número para string e atualiza o Label
	else:
		# Para o processamento quando o número atingir o máximo
		set_process(false)
