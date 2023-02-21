<?php

require_once(__DIR__."/../model/User.php");
require_once(__DIR__."/../model/UserMapper.php");

require_once(__DIR__."/../model/Expenses.php");
require_once(__DIR__."/../model/ExpensesMapper.php");

require_once(__DIR__."/BaseRest.php");

/**
* Class ExpenseRest
*
* It contains operations for creating, retrieving, updating, deleting and
* listing posts, as well as to create comments to posts.
*
* Methods gives responses following Restful standards. Methods of this class
* are intended to be mapped as callbacks using the URIDispatcher class.
*
*/
class ExpensesRest extends BaseRest {
	private $expenseMapper;

	public function __construct() {
		parent::__construct();

		$this->expenseMapper = new ExpensesMapper();
	}

	public function getExpenses() {
		$currentUser = parent::authenticateUser();
		$expenses = $this->expenseMapper->findAll();
		// json_encode Post objects.
		// since Post objects have private fields, the PHP json_encode will not
		// encode them, so we will create an intermediate array using getters and
		// encode it finally
		$expenses_array = array();
		foreach($expenses as $expense) {
			if($expense->getOwner() == $currentUser)
			array_push($expenses_array, array(
				"id" => $expense->getId(),
				"type_exp" => $expense->getTipo(),
				"date_exp" => $expense->getDate(),
				"amount" => $expense->getAmount(),
				"description_exp" => $expense->getDescription(),
				"file_exp" => $expense->getFile(),
				"owner" => $expense->getOwner()->getUsername()
			));
		}

		header($_SERVER['SERVER_PROTOCOL'].' 200 Ok');
		header('Content-Type: application/json');
		echo(json_encode($expenses_array));
	}

	public function createExpense($data) {
		$currentUser = parent::authenticateUser();
		$expense = new Expenses();

		if (isset($data->tipo) && isset($data->date)&& isset($data->amount)&& isset($data->description)&& isset($data->file)&& isset($data->content)) {
			$expense->setTipo($data->tipo);
			$expense->setDate($data->date);
			$expense->setAmount($data->amount);
			$expense->setDescription($data->description);
			$expense->setFile($data->file);
			$base64Content = $data->content;

			$expense->setOwner($currentUser);
		}

		try {
			// validate Post object
			$expense->checkIsValidForCreate(); // if it fails, ValidationException

			if (strlen($base64Content) > 0){
				if(!is_dir("../uploads/". $expense->getOwner()->getUsername())){
					mkdir("../uploads/". $expense->getOwner()->getUsername(), 0777);
				}

				$content = base64_decode($base64Content);
				$archivo = $expense->getFile();
				$archivo = str_replace(" ", "-", $archivo);
                $archivo = str_replace("_", "-", $archivo);

                $idunic = uniqid();

				$ruta = "../uploads/" . $expense->getOwner()->getUsername() . "/";
				$archivo = $idunic . "_" . $archivo;
				$rutaCompleta = $ruta . $archivo;
				$expense->setFile($archivo);

				file_put_contents($archivo, $content);
				rename($archivo, $rutaCompleta);
			}

			// save the Post object into the database
			$expenseId = $this->expenseMapper->save($expense);

			// response OK. Also send post in content
			header($_SERVER['SERVER_PROTOCOL'].' 201 Created');
			header('Location: '.$_SERVER['REQUEST_URI']."/".$expenseId);
			header('Content-Type: application/json');
			echo(json_encode(array(
				"id"=>$expenseId,
				"type_exp"=>$expense->getTipo(),
				"date_exp" => $expense->getDate(),
				"amount" => $expense->getAmount(),
				"description_exp" => $expense->getDescription(),
				"file_exp" => $expense->getFile()
			)));

		} catch (ValidationException $e) {
			header($_SERVER['SERVER_PROTOCOL'].' 400 Bad request');
			header('Content-Type: application/json');
			echo(json_encode($e->getErrors()));
		}
	}

	public function readExpense($expenseId) {
		$currentUser = parent::authenticateUser();
		$expense = $this->expenseMapper->findById($expenseId);

		if ($expense == NULL) {
			header($_SERVER['SERVER_PROTOCOL'].' 400 Bad request');
			echo("Expenses with id ".$expenseId." not found");
			return;
		}

		if ($expense->getOwner() != $currentUser) {
			header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
			echo("you are not the author of this expense");
			return;
		}

		$expenses_array = array(
			"id" => $expense->getId(),
			"type_exp" => $expense->getTipo(),
			"date_exp" => $expense->getDate(),
			"amount" => $expense->getAmount(),
			"description_exp" => $expense->getDescription(),
			"file_exp" => $expense->getFile(),
			"owner" => $expense->getOwner()->getUsername()
		);

		header($_SERVER['SERVER_PROTOCOL'].' 200 Ok');
		header('Content-Type: application/json');
		echo(json_encode($expenses_array));

	}

	public function updateExpense($expenseId, $data) {
		$currentUser = parent::authenticateUser();

		$expense = $this->expenseMapper->findById($expenseId);
		if ($expense == NULL) {
			header($_SERVER['SERVER_PROTOCOL'].' 400 Bad request');
			echo("Expenses with id ".$expenseId." not found");
			return;
		}

		// Check if the Post author is the currentUser (in Session)
		if ($expense->getOwner() != $currentUser) {
			header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
			echo("you are not the author of this expenses");
			return;
		}

		$expense->setTipo($data->tipo);
		$expense->setDate($data->date);
		$expense->setAmount($data->amount);
		$expense->setDescription($data->description);
		$oldFilename = $expense->getFile();
		$expense->setFile($data->file);
		$base64Content = $data->content;

		try {
			// validate Post object
			$expense->checkIsValidForUpdate(); // if it fails, ValidationException

			if (strlen($data->content) > 0) {
				if(!is_dir("../uploads/". $expense->getOwner()->getUsername())){
					mkdir("../uploads/". $expense->getOwner()->getUsername(), 0777);
				}

				$content = base64_decode($base64Content);
				$archivo = $expense->getFile();
				$archivo = str_replace(" ", "-", $archivo);
                $archivo = str_replace("_", "-", $archivo);

				$idunic = uniqid();

				$ruta = "../uploads/" . $expense->getOwner()->getUsername() . "/";
				$archivo = $idunic . "_" . $archivo;
				$rutaCompleta = $ruta . $archivo;
				$expense->setFile($archivo);

				file_put_contents($archivo, $content);
				rename($archivo, $rutaCompleta);

				$file_delete = $ruta . $oldFilename;
				if (file_exists($file_delete)) {
					unlink($file_delete);
				}
			} else {
				$expense->setFile($oldFilename);
			}
			
			$this->expenseMapper->update($expense);

			header($_SERVER['SERVER_PROTOCOL'].' 200 Ok');
		}catch (ValidationException $e) {
			header($_SERVER['SERVER_PROTOCOL'].' 400 Bad request');
			header('Content-Type: application/json');
			echo(json_encode($e->getErrors()));
		}
	}

	public function deleteExpense($expenseId) {
		$currentUser = parent::authenticateUser();
		$expense = $this->expenseMapper->findById($expenseId);

		if ($expense == NULL) {
			header($_SERVER['SERVER_PROTOCOL'].' 400 Bad request');
			echo("Expenses with id ".$expenseId." not found");
			return;
		}
		// Check if the Post author is the currentUser (in Session)
		if ($expense->getOwner() != $currentUser) {
			header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
			echo("you are not the author of this expenses");
			return;
		}

		if ($expense->getFile()) {
			$ruta = "../uploads/" . $expense->getOwner()->getUsername() . "/";
			$file_delete = $ruta . $expense->getFile();
			if (file_exists($file_delete)) {
				unlink($file_delete);
			}
		}

		$this->expenseMapper->delete($expense);

		header($_SERVER['SERVER_PROTOCOL'].' 204 No Content');
		header('Content-Type: application/json');
		echo(json_encode($expense));
	}

	public function getOrderedData($fechaInicio,$fechaFin){
		$currentUser = parent::authenticateUser();
		$expenses = $this->expenseMapper->getOrderedData($fechaInicio,$fechaFin);

		$expenses_array = array();
		foreach($expenses as $expense) {
			if ($expense[3] == $currentUser){
				array_push($expenses_array, array(
					"type_exp" => $expense[0],
					"date_exp" => $expense[1],
					"amount" => $expense[2],
					"owner" => $expense[3]->getUsername()
				));
			}
		}

		header($_SERVER['SERVER_PROTOCOL'].' 200 Ok');
		header('Content-Type: application/json');
		echo(json_encode($expenses_array));

	}
}

// URI-MAPPING for this Rest endpoint
$expenseRest = new ExpensesRest();
URIDispatcher::getInstance()
->map("GET", "/expense", array($expenseRest,"getExpenses"))
->map("GET", "/expense/$1", array($expenseRest,"readExpense"))
->map("GET", "/expense/$1/$2", array($expenseRest,"getOrderedData"))
->map("POST", "/expense", array($expenseRest,"createExpense"))
->map("PUT",	"/expense/$1", array($expenseRest,"updateExpense"))
->map("DELETE", "/expense/$1", array($expenseRest,"deleteExpense"));
