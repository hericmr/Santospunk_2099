extends Sprite2D

# Função chamada quando o nó entra na árvore de cena pela primeira vez
func _ready() -> void:
	# Define o Sprite como invisível inicialmente
	visible = false
	
	# Espera 2 segundos antes de torná-lo visível
	await get_tree().create_timer(2.0).timeout
	
	# Torna o Sprite visível
	visible = true
